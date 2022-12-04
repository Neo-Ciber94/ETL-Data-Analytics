import { TransactionError } from "../../model/transaction_error.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";

/**
 * Provides a method to return an stream of transactions.
 */
export interface TransactionSource<T> {
  /**
   * Returns a stream of data.
   */
  stream(): Stream<Result<T, TransactionError>>;
}
