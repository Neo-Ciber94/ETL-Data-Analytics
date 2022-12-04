import path from "path";
import express from "express";
import { queueKeys } from "../config/queues.js";
import { messageQueue } from "../db/mq/rabbitmq.js";
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

interface Summary {
  count: number;
}

export const etlRouter = express.Router();

etlRouter.post("/process", async (_req, res) => {
  try {
    const summary = await processTransactions();
    console.log(`${summary.count} transactions successfully processed`);
    return res.status(200).json({
      message: `${summary.count} transactions where successfully processed`,
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
  const logger: Logger = getLogger();
  const client = prismaClient;
  const customerRepository = new CustomerRepository(client);
  const etl = new TransactionEtl({ logger });

  const counter = { count: 0 };
  const onSuccessfullyProcessed = () => {
    counter.count += 1;
  };

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
    // .pipe(
    //   new CsvTransactionSource({
    //     filePath: path.join(process.cwd(), "sn/data/group-a.csv"),
    //     logger,
    //   }),
    //   new CsvTransactionConsumer({
    //     onSuccessfullyProcessed,
    //     customerRepository,
    //   })
    // )
    // .pipe(
    //   new XmlTransactionSource({
    //     filePath: path.join(process.cwd(), "sn/data/group-c.xml"),
    //     logger,
    //   }),
    //   new XmlTransactionConsumer({
    //     onSuccessfullyProcessed,
    //     customerRepository,
    //   })
    // )
    .results();

  const channel = await messageQueue.createChannel();

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

  await messageQueue.close();
  return {
    count: counter.count,
  };
}
