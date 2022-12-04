import { Logger } from "../../logging/logger.js";
import { Report } from "../../validations/report_schema";
import { TransactionError } from "../../model/transaction_error.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";
import { TransactionConsumer } from "../consumers/transaction_consumer.js";
import { TransactionSource } from "../sources/transaction_source.js";
import { Etl } from "./etl.js";

type EtlSource = [TransactionSource<unknown>, TransactionConsumer<unknown>];

export interface TransactionEtlOptions {
  readonly logger?: Logger;
}

export class TransactionEtl implements Etl {
  private readonly streams: EtlSource[] = [];

  constructor(readonly options: TransactionEtlOptions = {}) {}

  pipe<T>(
    source: TransactionSource<T>,
    transformer: TransactionConsumer<T>
  ): this {
    this.streams.push([source, transformer]);
    return this;
  }

  async *results(): Stream<Result<Report, TransactionError>> {
    for (const [source, consumer] of this.streams) {
      try {
        const data = source.stream(); // extract
        const reports = consumer.process(data); // transform
        yield* reports; // load
      } catch (e) {
        yield Result.error({
          message: `Failed to process transactions: ${JSON.stringify(e)}`,
        });
      }
    }
  }
}
