import { Report } from "../../model/report";
import { TransactionError } from "../../model/transaction_error";
import { LocalReportMap } from "../../utils/report_map";
import { Result } from "../../utils/result";
import { Stream } from "../../utils/streams";
import { XmlTransaction } from "../../validations/xml_transaction_schema";
import { TransactionConsumer } from "../interfaces/transaction_consumer";

export class XmlTransactionConsumer
  implements TransactionConsumer<XmlTransaction>
{
  async *process(
    transactions: Stream<XmlTransaction>
  ): Stream<Result<Report, TransactionError>> {
    const reports = new LocalReportMap();

    for await (const t of transactions) {
      reports.post({
        company: t.company,
        total_amount: t.total,
        total_stock: t.stock,
        type: t.code,
      });
    }

    for (const report of reports.getAll()) {
      yield Result.ok(report);
    }
  }
}
