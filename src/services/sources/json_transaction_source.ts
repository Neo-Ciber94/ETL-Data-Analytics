import { Stream } from "../../utils/streams.js";
import { JsonTransaction } from "../../validations/transactions_validation.js";
import { TransactionSource } from "../interfaces/transaction_source.js";

export class JsonTransactionSource
  implements TransactionSource<JsonTransaction>
{
  async *getAll(): Stream<JsonTransaction> {
    // FIXME: Streaming the json response could be better to prevent load +10mb.
    const res = await fetch(
      "https://softrizon.com/wp-content/uploads/ch/group-b.json"
    );

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

    yield* Stream.from(json);
  }
}
