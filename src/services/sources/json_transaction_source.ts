import { TransactionError } from "../../model/transaction_error.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";
import {
  JsonTransaction,
  jsonTransactionSchema,
} from "../../validations/json_transaction_schema.js";

import { TransactionSource } from "./transaction_source.js";

export class JsonTransactionSource
  implements TransactionSource<JsonTransaction>
{
  constructor(readonly url: string) {}

  async *getAll(): Stream<Result<JsonTransaction, TransactionError>> {
    // FIXME: Streaming the json response could be better to prevent load +10mb.
    const res = await fetch(this.url);

    if (!res.ok) {
      throw Error(
        `failed to fetch transactions from external source: ${res.status} ${res.statusText}`
      );
    }

    const json = await res.json();

    if (!Array.isArray(json)) {
      throw new Error(
        `Invalid transaction type, expected array but was: ${typeof json}`
      );
    }

    for (const data of json) {
      const result = jsonTransactionSchema.safeParse(data);
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
