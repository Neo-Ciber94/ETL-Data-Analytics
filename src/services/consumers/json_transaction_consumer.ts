import { Report } from "../../validations/report_schema.js";
import { TransactionError } from "../../model/transaction_error.js";
import { LocalCustomerInsightReport } from "../../utils/report_map.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";
import { noop } from "../../utils/noop.js";
import { JsonTransaction } from "../../validations/json_transaction_schema.js";
import { InputStream, TransactionConsumer } from "./transaction_consumer.js";
import { CustomerRepository } from "../../repositories/customer.repository.js";

export interface JsonTransactionConsumerOptions {
  readonly onSuccessfullyProcessed?: (transaction: JsonTransaction) => void;
  readonly customerRepository: CustomerRepository;
}

export class JsonTransactionConsumer
  implements TransactionConsumer<JsonTransaction>
{
  constructor(readonly options: JsonTransactionConsumerOptions) {}

  async *process(
    transactions: InputStream<JsonTransaction>
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
            const customer = await customerRepository.getByAccountId(
              t.account_id
            );

            if (customer == null) {
              yield Result.error({
                message: `Customer with account ${t.account_id} was not found`,
              });
              continue;
            }
            
            reports.post({
              customer: {
                name: customer.name,
                username: customer.username,
              },
              total_amount: t.total,
              total_stock: t.amount,
              type: t.transaction_code,
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
