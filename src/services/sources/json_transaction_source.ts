import { TransactionError } from "../../model/transaction_error.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";
import {
  JsonTransaction,
  JsonTransactionSchema,
} from "../../validations/transactions_validation.js";
import { TransactionSource } from "../interfaces/transaction_source.js";

export class JsonTransactionSource
  implements TransactionSource<JsonTransaction>
{
  private readonly endpoint =
    "https://softrizon.com/wp-content/uploads/ch/group-b.json";

  async *getAll(): Stream<Result<JsonTransaction, TransactionError>> {
    // FIXME: Streaming the json response could be better to prevent load +10mb.
    const res = await fetch(this.endpoint);

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
      const result = JsonTransactionSchema.safeParse(data);
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
