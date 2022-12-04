import { queueKeys } from "../config/queues.js";
import { messageQueue } from "../db/mq/rabbitmq.js";
import { getLogger, Logger } from "../logging/logger.js";
import { JsonTransactionConsumer } from "../services/consumers/json_transaction_consumer.js";
import { TransactionEtl } from "../services/etl/transaction_etl.js";
import { JsonTransactionSource } from "../services/sources/json_transaction_source.js";
import { MongoClient } from "../db/mongo/client.mongo.js";
import { ReportModel } from "../db/mongo/report.mongo.js";
import express from "express";

interface Counter {
  count: number;
}

export const etlRouter = express.Router();

etlRouter.post("/process", async (_req, res) => {
  const ref = { count: 0 };

  try {
    await processTransactions(ref);
    return res.status(200).json({
      message: `${ref.count} transactions where successfully processed`,
      success: true,
    });
  } catch {
    return res.status(500).json({
      message: `Failed to process transactions`,
      success: false,
    });
  }
});

async function processTransactions(counter: Counter) {
  const logger: Logger = getLogger();
  const etl = new TransactionEtl({ logger });

  const results = etl
    .pipe(
      new JsonTransactionSource({
        url: "https://www.softrizon.com/wp-content/uploads/ch/group-b.json",
        logger,
      }),
      new JsonTransactionConsumer({
        onSuccessfullyProcessed() {
          counter.count += 1;
        },
      })
    )
    .results();

  const mqChannel = await messageQueue.createChannel();
  const mongoConn = await MongoClient.connect();

  await mqChannel.consume(queueKeys.queue.errors, (msg) => {
    const buffer = msg?.content;
    if (buffer) {
      const json = buffer.toString();
      console.log({ json });
    }
  });

  for await (const result of results) {
    console.log(`${Date.now()} - Publishing ${result.type} result to queue`);
    switch (result.type) {
      case "error":
        {
          mqChannel.publish(
            queueKeys.exchanges.transactions,
            queueKeys.routingKey.error,
            Buffer.from(result.error.message)
          );
        }
        break;
      case "success":
        {
          mqChannel.publish(
            queueKeys.exchanges.transactions,
            queueKeys.routingKey.insight,
            Buffer.from(JSON.stringify(result.data))
          );

          const reportModel = new ReportModel({
            ...result.data,
          });

          await reportModel.save();
        }
        break;
      default:
        break;
    }
  }

  await messageQueue.close();
  await mongoConn.close();
  console.log("done");
}