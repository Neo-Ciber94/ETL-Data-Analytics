// Import env first
import "./env.js";
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

for await (const result of results) {
  console.log(result);
}
