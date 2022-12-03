import { Report } from "../../model/report.js";
import { TransactionError } from "../../model/transaction_error.js";
import { LocalReportMap } from "../../utils/report_map.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";
import { JsonTransaction } from "../../validations/json_transaction_schema.js";
import { TransactionConsumer } from "../interfaces/transaction_consumer.js";

export class JsonTransactionConsumer
  implements TransactionConsumer<JsonTransaction>
{
  async *process(
    transactions: Stream<JsonTransaction>
  ): Stream<Result<Report, TransactionError>> {
    const reports = new LocalReportMap();

    for await (const t of transactions) {
      reports.post({
        company: t.symbol,
        total_amount: t.total,
        total_stock: t.amount,
        type: t.transaction_code,
      });
    }

    for (const report of reports.getAll()) {
      yield Result.ok(report);
    }
  }
}
