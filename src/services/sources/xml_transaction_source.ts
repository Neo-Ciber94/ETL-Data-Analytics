import { TransactionError } from "../../model/transaction_error.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";
import {
  XmlTransaction,
  xmlTransactionSchema,
} from "../../validations/xml_transaction_schema.js";
import { TransactionSource } from "./transaction_source.js";
import fs from "fs/promises";
import { xmlToJson } from "../../utils/xml_to_json.js";

export class XmlTransactionSource implements TransactionSource<XmlTransaction> {
  constructor(readonly filePath: string) {}

  async *getAll(): Stream<Result<XmlTransaction, TransactionError>> {
    const contents = await fs.readFile(this.filePath, "utf8");
    const results = await xmlToJson(contents, {
      explicitArray: false,
    });

    /**
     * We expected the XML in the form:
     * <transactions>
     *      <transaction>
     *          ...
     *      <transaction>
     * </transactions>
     */
    const transactions = (<any>results)?.transactions?.transaction;

    if (!Array.isArray(transactions)) {
      throw new Error(
        `expected array of results but was ${typeof transactions}: ${JSON.stringify(
          transactions,
          null,
          2
        )}`
      );
    }

    for (const data of transactions) {
      const result = xmlTransactionSchema.safeParse(data);
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
