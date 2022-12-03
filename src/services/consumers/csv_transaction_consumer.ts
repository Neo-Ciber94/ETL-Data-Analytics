import { Report } from "../../model/report";
import { TransactionError } from "../../model/transaction_error";
import { LocalReportMap } from "../../utils/report_map";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams";
import { CsvTransaction } from "../../validations/csv_transaction_schema";
import { TransactionConsumer } from "../interfaces/transaction_consumer";

export class CsvTransactionConsumer
  implements TransactionConsumer<CsvTransaction>
{
  async *process(
    transactions: Stream<CsvTransaction>
  ): Stream<Result<Report, TransactionError>> {
    const reports = new LocalReportMap();

    for await (const t of transactions) {
      const key = t.company;
      reports.addOrUpdate(key, {
        total_amount: t.total,
        total_stock: t.total_stock,
        type: t.transaction_type,
      });
    }

    for (const report of reports.values()) {
      yield Result.ok(report);
    }
  }
}
