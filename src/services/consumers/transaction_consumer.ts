import { Report } from "../../validations/report_schema.js";
import { TransactionError } from "../../model/transaction_error.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";

export type InputStream<T> = Stream<Result<T, TransactionError>>;

/**
 * Provides a method to process a stream of transactions and returns an stream of results.
 */
export interface TransactionConsumer<T> {
  /**
   * Process all the given transactions and return the results as a async iterator (stream).
   * @param transactions The stream of transactions to process.
   */
  process(
    transactions: InputStream<T>
  ): Stream<Result<Report, TransactionError>>;
}
