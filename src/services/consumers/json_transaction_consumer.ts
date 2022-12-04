import { Report } from "../../validations/report_schema.js";
import { TransactionError } from "../../model/transaction_error.js";
import { LocalReportMap } from "../../utils/report_map.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";
import { JsonTransaction } from "../../validations/json_transaction_schema.js";
import { InputStream, TransactionConsumer } from "./transaction_consumer.js";

export class JsonTransactionConsumer
  implements TransactionConsumer<JsonTransaction>
{
  async *process(
    transactions: InputStream<JsonTransaction>
  ): Stream<Result<Report, TransactionError>> {
    const reports = new LocalReportMap();

    for await (const result of transactions) {
      switch (result.type) {
        case "error":
          yield result;
          break;
        case "success":
          {
            const t = result.data;
            reports.post({
              company: t.symbol,
              total_amount: t.total,
              total_stock: t.amount,
              type: t.transaction_code,
            });
          }
          break;
      }
    }

    for (const report of reports.getAll()) {
      yield Result.ok(report);
    }
  }
}
