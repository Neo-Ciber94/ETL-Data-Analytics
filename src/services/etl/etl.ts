import { TransactionError } from "../../model/transaction_error";
import { Result } from "../../utils/result";
import { Stream } from "../../utils/streams";
import { Report } from "../../validations/report_schema";
import { TransactionConsumer } from "../consumers/transaction_consumer";
import { TransactionSource } from "../sources/transaction_source";

/**
 * Provides an implementation for a `extract-transform-load`.
 */
export interface Etl {
  /**
   * Push a source of data and transformer.
   * @param source The source of the data.
   * @param transformer Transform the data to a report.
   */
  pipe<T>(
    source: TransactionSource<T>,
    transformer: TransactionConsumer<T>
  ): this;

  /**
   * Returns a stream of results.
   */
  results(): Stream<Result<Report, TransactionError>>;
}
