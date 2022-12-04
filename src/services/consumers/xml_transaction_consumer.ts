import { Report } from "../../validations/report_schema.js";
import { TransactionError } from "../../model/transaction_error.js";
import { LocalCustomerInsightReport } from "../../utils/report_map.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";
import { noop } from "../../utils/noop.js";
import { XmlTransaction } from "../../validations/xml_transaction_schema.js";
import { InputStream, TransactionConsumer } from "./transaction_consumer.js";
import { CustomerRepository } from "../../repositories/customer.repository.js";

export interface XmlTransactionConsumerOptions {
  readonly onSuccessfullyProcessed?: (transaction: XmlTransaction) => void;
  readonly customerRepository: CustomerRepository;
}

export class XmlTransactionConsumer
  implements TransactionConsumer<XmlTransaction>
{
  constructor(readonly options: XmlTransactionConsumerOptions) {}

  async *process(
    transactions: InputStream<XmlTransaction>
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
            const customer =
              await customerRepository.dangerouslyGetCustomerByName(t.name);

            if (customer == null) {
              yield Result.error({
                message: `Customer with name ${t.name} was not found`,
              });
              continue;
            }

            reports.post({
              customer: {
                name: customer.name,
                username: customer.username,
              },
              total_amount: t.total,
              total_stock: t.stock,
              type: t.code,
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
