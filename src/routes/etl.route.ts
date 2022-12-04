import path from "path";
import express from "express";
import { queueKeys } from "../config/queues.js";
import { connectToQueue } from "../db/mq/rabbitmq.js";
import { getLogger, Logger } from "../logging/logger.js";
import { JsonTransactionConsumer } from "../services/consumers/json_transaction_consumer.js";
import { TransactionEtl } from "../services/etl/transaction_etl.js";
import { JsonTransactionSource } from "../services/sources/json_transaction_source.js";
import { CsvTransactionSource } from "../services/sources/csv_transaction_source.js";
import { CsvTransactionConsumer } from "../services/consumers/csv_transaction_consumer.js";
import { XmlTransactionSource } from "../services/sources/xml_transaction_source.js";
import { XmlTransactionConsumer } from "../services/consumers/xml_transaction_consumer.js";
import { CustomerRepository } from "../repositories/customer.repository.js";
import { prismaClient } from "../db/sql/client.prisma.js";
import { Report } from "../validations/report_schema.js";
import { Result } from "../utils/result.js";
import { Stream } from "../utils/streams.js";
import { TransactionError } from "../model/transaction_error.js";
import { MemoryCache } from "../caching/memory.cache.js";
import { customers } from "@prisma/client";
import amqplib from "amqplib";

interface Summary {
  count: number;
  elapsed: number;
}

export const etlRouter = express.Router();

etlRouter.post("/process", async (_req, res) => {
  try {
    const summary = await processTransactions();
    console.log(`${summary.count} transactions successfully processed`);
    return res.status(200).json({
      message: `${summary.count} transactions where successfully processed`,
      duration: `${summary.elapsed}ms`,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Failed to process transactions`,
      error,
      success: false,
    });
  }
});

async function processTransactions(): Promise<Summary> {
  // deps
  const mqConnection = await connectToQueue();
  const logger: Logger = getLogger();
  const client = prismaClient;
  const customerCache = new MemoryCache<customers>("customers"); // TODO: Change for redis
  const customerRepository = new CustomerRepository({
    client,
    cache: customerCache,
  });

  // summaries
  const startTime = performance.now();
  const counter = { count: 0 };
  const onSuccessfullyProcessed = () => {
    counter.count += 1;
  };

  const etl = new TransactionEtl({ logger });

  const results = etl
    .pipe(
      new JsonTransactionSource({
        url: "https://www.softrizon.com/wp-content/uploads/ch/group-b.json",
        logger,
      }),
      new JsonTransactionConsumer({
        onSuccessfullyProcessed,
        customerRepository,
      })
    )
    .pipe(
      new CsvTransactionSource({
        filePath: path.join(process.cwd(), "sn/data/group-a.csv"),
        logger,
      }),
      new CsvTransactionConsumer({
        onSuccessfullyProcessed,
        customerRepository,
      })
    )
    .pipe(
      new XmlTransactionSource({
        filePath: path.join(process.cwd(), "sn/data/group-c.xml"),
        logger,
      }),
      new XmlTransactionConsumer({
        onSuccessfullyProcessed,
        customerRepository,
      })
    )
    .results();

  // Publish results to queues
  const channel = await mqConnection.createChannel();
  await publishResults(channel, results);
  await mqConnection.close();

  const endTime = performance.now();
  const elapsed = endTime - startTime;
  // console.log(`${MemoryCache.bytesUsed} bytes used in memory cache`);

  return {
    count: counter.count,
    elapsed,
  };
}

async function publishResults(
  channel: amqplib.Channel,
  results: Stream<Result<Report, TransactionError>>
) {
  // FIXME: This should be parallelized
  for await (const result of results) {
    // console.log(`${Date.now()} - Publishing ${result.type} result to queue`);

    switch (result.type) {
      case "error":
        {
          channel.publish(
            queueKeys.exchanges.transactions,
            queueKeys.routingKey.error,
            Buffer.from(result.error.message)
          );
        }
        break;
      case "success":
        {
          channel.publish(
            queueKeys.exchanges.transactions,
            queueKeys.routingKey.insight,
            Buffer.from(JSON.stringify(result.data))
          );
        }
        break;
      default:
        break;
    }
  }
}
