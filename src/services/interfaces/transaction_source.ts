import { Stream } from "../../utils/streams";

/**
 * Provides a method to return an stream of transactions.
 */
export interface TransactionSource<T> {
  /**
   * Returns a stream of data.
   *
   * @remarks We could return a `Result<Stream<T>>` for a more functional error handling.
   */
  getAll(): Stream<T>;
}
