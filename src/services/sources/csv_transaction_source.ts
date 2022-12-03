import { Stream } from "../../utils/streams.js";
import { TransactionSource } from "../interfaces/transaction_source.js";
import fs from "fs";
import readline from "readline/promises";
import { TransactionError } from "../../model/transaction_error.js";
import { Result } from "../../utils/result.js";
import {
  CsvTransaction,
  csvTransactionSchema,
} from "../../validations/csv_transaction_schema.js";

export class CsvTransactionSource implements TransactionSource<CsvTransaction> {
  constructor(readonly filePath: string) {}

  async *getAll(): Stream<Result<CsvTransaction, TransactionError>> {
    const fileStream = fs.createReadStream(this.filePath);
    const lines = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let headers: string[] = [];
    let lineNumber = 0;

    for await (const line of lines) {
      const row = line.split(",");
      const curLineNumber = lineNumber++;

      if (curLineNumber === 0) {
        headers = row;
        continue;
      }

      const obj = {} as any;
      for (let i = 0; i < headers.length; i++) {
        const key = headers[i]!; // SAFETY: index in range
        obj[key] = row[i];
      }

      const result = csvTransactionSchema.safeParse(obj);
      if (result.success) {
        yield Result.ok(result.data);
      } else {
        yield Result.error({
          message: result.error.message,
        });
      }
    }
  }
}
