import { JsonTransactionConsumer } from "./services/consumers/json_transaction_consumer.js";
import { TransactionEtl } from "./services/etl/transaction_etl.js";
import { JsonTransactionSource } from "./services/sources/json_transaction_source.js";

const etl = new TransactionEtl();
const results = etl
  .pipe(
    new JsonTransactionSource({
      url: "https://www.softrizon.com/wp-content/uploads/ch/group-b.json",
    }),
    new JsonTransactionConsumer()
  )
  .results();

for await (const result of results) {
  console.log(result);
}
