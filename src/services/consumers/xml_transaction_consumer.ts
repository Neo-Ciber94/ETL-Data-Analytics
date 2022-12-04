import { Report } from "../../validations/report_schema.js";
import { TransactionError } from "../../model/transaction_error.js";
import { LocalReportMap } from "../../utils/report_map.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";
import { XmlTransaction } from "../../validations/xml_transaction_schema.js";
import { InputStream, TransactionConsumer } from "./transaction_consumer.js";

export class XmlTransactionConsumer
  implements TransactionConsumer<XmlTransaction>
{
  async *process(
    transactions: InputStream<XmlTransaction>
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
              total_stock: t.stock,
              type: t.code,
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
