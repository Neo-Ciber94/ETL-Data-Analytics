import { TransactionError } from "../../model/transaction_error.js";
import { LocalReportMap } from "../../utils/report_map.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";
import { noop } from "../../utils/noop.js";
import { CsvTransaction } from "../../validations/csv_transaction_schema.js";
import { Report } from "../../validations/report_schema.js";
import { InputStream, TransactionConsumer } from "./transaction_consumer.js";

export interface CsvTransactionConsumerOptions {
  readonly onSuccessfullyProcessed?: (transaction: CsvTransaction) => void;
}

export class CsvTransactionConsumer
  implements TransactionConsumer<CsvTransaction>
{
  constructor(readonly options: CsvTransactionConsumerOptions = {}) {}

  async *process(
    transactions: InputStream<CsvTransaction>
  ): Stream<Result<Report, TransactionError>> {
    const { onSuccessfullyProcessed = noop } = this.options;
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

            onSuccessfullyProcessed({ ...t });
          }
          break;
      }
    }

    for (const report of reports.getAll()) {
      yield Result.ok(report);
    }
  }
}
