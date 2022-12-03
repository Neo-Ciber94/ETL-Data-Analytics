import { Report } from "../../model/report";
import { TransactionError } from "../../model/transaction_error";
import { Result } from "../../utils/result";

export type TransactionResult = Result<Report, TransactionError>;
export type TransactionStream = AsyncGenerator<TransactionResult>;

/**
 * Provides a method to process a stream of transactions and returns an stream of results.
 */
export interface ITransactionProcessor {
  process(): TransactionStream;
}
