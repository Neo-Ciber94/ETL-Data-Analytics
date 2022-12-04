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
import { Logger, nullLogger } from "../../logging/logger.js";

export interface XmlTransactionSourceOptions {
  readonly filePath: string;
  readonly logger?: Logger;
}

export class XmlTransactionSource implements TransactionSource<XmlTransaction> {
  constructor(readonly options: XmlTransactionSourceOptions) {}

  async *stream(): Stream<Result<XmlTransaction, TransactionError>> {
    const { filePath, logger = nullLogger } = this.options;
    const contents = await fs.readFile(filePath, "utf8");
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        logger.error(result.error.message);
        yield Result.error({
          message: result.error.message,
        });
      }
    }
  }
}
