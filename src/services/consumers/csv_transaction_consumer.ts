import { TransactionError } from "../../model/transaction_error.js";
import { LocalCustomerInsightReport } from "../../utils/report_map.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";
import { noop } from "../../utils/noop.js";
import { CsvTransaction } from "../../validations/csv_transaction_schema.js";
import { Report } from "../../validations/report_schema.js";
import { InputStream, TransactionConsumer } from "./transaction_consumer.js";
import { CustomerRepository } from "../../repositories/customer.repository.js";

export interface CsvTransactionConsumerOptions {
  readonly customerRepository: CustomerRepository;
  readonly onSuccessfullyProcessed?: (transaction: CsvTransaction) => void;
}

export class CsvTransactionConsumer
  implements TransactionConsumer<CsvTransaction>
{
  constructor(readonly options: CsvTransactionConsumerOptions) {}

  async *process(
    transactions: InputStream<CsvTransaction>
  ): Stream<Result<Report, TransactionError>> {
    const { onSuccessfullyProcessed = noop, customerRepository } = this.options;
    const reports = new LocalCustomerInsightReport();

    for await (const result of transactions) {
      switch (result.type) {
        case "error":
          yield result;
          break;
        case "success":
          {
            const t = result.data;
            const customer = await customerRepository.getByEmail(t.email);

            if (customer == null) {
              yield Result.error({
                message: `Customer with email ${t.email} was not found`,
              });
              continue;
            }

            reports.post({
              customer: {
                name: customer.name,
                username: customer.username,
              },
              total_amount: t.total,
              total_stock: t.total_stock,
              type: t.transaction_type,
            });

            onSuccessfullyProcessed({ ...t });
          }
          break;
      }
    }

    for (const report of reports.reports()) {
      yield Result.ok(report);
    }
  }
}
