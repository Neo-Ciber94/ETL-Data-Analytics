import { Stream } from "../../utils/streams";

/**
 * Provides a method to return an stream of transactions.
 */
export interface TransactionSource<T> {
  getAll(): Stream<T>;
}
