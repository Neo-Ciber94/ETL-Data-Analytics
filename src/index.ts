// Import env first
import "./env.js";
import { queueKeys } from "./config/queues.js";
import { messageQueue } from "./db/mq/rabbitmq.js";
import { getLogger, Logger } from "./logging/logger.js";
import { JsonTransactionConsumer } from "./services/consumers/json_transaction_consumer.js";
import { TransactionEtl } from "./services/etl/transaction_etl.js";
import { JsonTransactionSource } from "./services/sources/json_transaction_source.js";

const logger: Logger = getLogger();
const etl = new TransactionEtl({ logger });

const results = etl
  .pipe(
    new JsonTransactionSource({
      url: "https://www.softrizon.com/wp-content/uploads/ch/group-b.json",
      logger,
    }),
    new JsonTransactionConsumer()
  )
  .results();

const channel = await messageQueue.createChannel();

channel.consume(queueKeys.queue.errors, (msg) => {
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

messageQueue.close();
console.log("done");
