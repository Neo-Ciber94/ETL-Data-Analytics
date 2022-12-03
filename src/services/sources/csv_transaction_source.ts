import { Stream } from "../../utils/streams.js";
import { TransactionSource } from "../interfaces/transaction_source.js";
import { TransactionError } from "../../model/transaction_error.js";
import { Result } from "../../utils/result.js";
import {
  CsvTransaction,
  csvTransactionSchema,
} from "../../validations/csv_transaction_schema.js";
import { csvToJsonStream } from "../../utils/csv_to_json.js";

export class CsvTransactionSource implements TransactionSource<CsvTransaction> {
  constructor(readonly filePath: string, readonly separator = ",") {}

  async *getAll(): Stream<Result<CsvTransaction, TransactionError>> {
    const results = csvToJsonStream({
      filePath: this.filePath,
      separator: this.separator,
      onError: (e) => {
        console.error(e);
      },
    });

    for await (const obj of results) {
      const result = csvTransactionSchema.safeParse(obj);

      if (result.success) {
        yield Result.ok(result.data);
      } else {
        console.error(result.error.message);
        yield Result.error({
          message: result.error.message,
        });
      }
    }
  }
}
