import { TransactionError } from "../../model/transaction_error.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";
import {
  XmlTransaction,
  xmlTransactionSchema,
} from "../../validations/xml_transaction_schema.js";
import { TransactionSource } from "../interfaces/transaction_source.js";
import fs from "fs/promises";
import { xmlToJson } from "../../utils/xml_to_json.js";

export class XmlTransactionSource implements TransactionSource<XmlTransaction> {
  constructor(readonly filePath: string) {}

  async *getAll(): Stream<Result<XmlTransaction, TransactionError>> {
    const contents = await fs.readFile(this.filePath, "utf8");
    const results = await xmlToJson(contents);

    if (Array.isArray(results)) {
      throw new Error(`expected array of results but was ${typeof results}`);
    }

    for (const data of results as any[]) {
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
