import path from "path";
import { queueKeys } from "../../config/queues.js";
import { Logger } from "../../logging/logger.js";
import { JsonTransactionConsumer } from "../../services/consumers/json_transaction_consumer.js";
import { TransactionEtl } from "../../services/etl/transaction_etl.js";
import { JsonTransactionSource } from "../../services/sources/json_transaction_source.js";
import { CsvTransactionSource } from "../../services/sources/csv_transaction_source.js";
import { CsvTransactionConsumer } from "../../services/consumers/csv_transaction_consumer.js";
import { XmlTransactionSource } from "../../services/sources/xml_transaction_source.js";
import { XmlTransactionConsumer } from "../../services/consumers/xml_transaction_consumer.js";
import { CustomerRepository } from "../../repositories/customer.repository.js";
import { Report } from "../../validations/report_schema.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";
import { TransactionError } from "../../model/transaction_error.js";
import amqplib from "amqplib";

export interface Summary {
  count: number;
  elapsed: number;
}

export interface TransactionAggregatorConfig {
  mqConnection: amqplib.Connection;
  logger: Logger;
  customerRepository: CustomerRepository;
}

/**
 * Entry point to process all the transactions.
 */
export class TransactionAggregator {
  constructor(private readonly options: TransactionAggregatorConfig) {}

  async process(): Promise<Summary> {
    // deps
    const { mqConnection, logger, customerRepository } = this.options;

    // summaries
    const startTime = performance.now();
    const counter = { count: 0 };
    const onSuccessfullyProcessed = () => {
      counter.count += 1;
    };

    const etl = new TransactionEtl({ logger });

    const results = etl
      .pipe(
        new JsonTransactionSource({
          url: "https://www.softrizon.com/wp-content/uploads/ch/group-b.json",
          logger,
        }),
        new JsonTransactionConsumer({
          onSuccessfullyProcessed,
          customerRepository,
        })
      )
      .pipe(
        new CsvTransactionSource({
          filePath: path.join(process.cwd(), "sn/data/group-a.csv"),
          logger,
        }),
        new CsvTransactionConsumer({
          onSuccessfullyProcessed,
          customerRepository,
        })
      )
      .pipe(
        new XmlTransactionSource({
          filePath: path.join(process.cwd(), "sn/data/group-c.xml"),
          logger,
        }),
        new XmlTransactionConsumer({
          onSuccessfullyProcessed,
          customerRepository,
        })
      )
      .results();

    // Publish results to queues
    const channel = await mqConnection.createChannel();
    await publishResults(channel, results);
    await mqConnection.close();

    const endTime = performance.now();
    const elapsed = endTime - startTime;

    return {
      count: counter.count,
      elapsed,
    };
  }
}

async function publishResults(
  channel: amqplib.Channel,
  results: Stream<Result<Report, TransactionError>>
) {
  for await (const result of results) {
    // console.log(`${Date.now()} - Publishing ${result.type} result to queue`);

    const publishOptions: amqplib.Options.Publish = {
      expiration: 1000,
      timestamp: Date.now(),
    };

    switch (result.type) {
      case "error":
        {
          channel.publish(
            queueKeys.exchanges.transactions,
            queueKeys.routingKey.error,
            Buffer.from(result.error.message),
            publishOptions
          );
        }
        break;
      case "success":
        {
          channel.publish(
            queueKeys.exchanges.transactions,
            queueKeys.routingKey.insight,
            Buffer.from(JSON.stringify(result.data)),
            publishOptions
          );
        }
        break;
      default:
        break;
    }
  }
}
