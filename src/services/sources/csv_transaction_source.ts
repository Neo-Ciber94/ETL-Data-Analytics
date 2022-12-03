import { Stream } from "../../utils/streams.js";
import { TransactionSource } from "./transaction_source.js";
import { TransactionError } from "../../model/transaction_error.js";
import { Result } from "../../utils/result.js";
import {
  CsvTransaction,
  csvTransactionSchema,
} from "../../validations/csv_transaction_schema.js";
import { csvToJsonStream } from "../../utils/csv_to_json.js";
import { Logger, nullLogger } from "../../logging/logger.js";

export interface CsvTransactionSourceOptions {
  readonly filePath: string;
  readonly separator?: string;
  readonly logger?: Logger;
}

export class CsvTransactionSource implements TransactionSource<CsvTransaction> {
  constructor(readonly options: CsvTransactionSourceOptions) {}

  async *getAll(): Stream<Result<CsvTransaction, TransactionError>> {
    const { filePath, separator, logger = nullLogger } = this.options;
    const results = csvToJsonStream({
      filePath: filePath,
      separator: separator,
      onError: (e) => {
        logger.error(e);
      },
    });

    for await (const obj of results) {
      const result = csvTransactionSchema.safeParse(obj);

      if (result.success) {
        yield Result.ok(result.data);
      } else {
        logger.error(result.error.message);
        yield Result.error({
          message: result.error.message,
        });
      }
    }
  }
}
