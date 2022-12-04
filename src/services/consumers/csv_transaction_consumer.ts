import { Report } from "../../model/report";
import { TransactionError } from "../../model/transaction_error";
import { LocalReportMap } from "../../utils/report_map";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams";
import { CsvTransaction } from "../../validations/csv_transaction_schema";
import { InputStream, TransactionConsumer } from "./transaction_consumer";

export class CsvTransactionConsumer
  implements TransactionConsumer<CsvTransaction>
{
  async *process(
    transactions: InputStream<CsvTransaction>
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
              company: t.company,
              total_amount: t.total,
              total_stock: t.total_stock,
              type: t.transaction_type,
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
