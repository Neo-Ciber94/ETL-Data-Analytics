import { test, describe, expect } from "vitest";
import path from "path";
import { XmlTransactionSource } from "../../../src/services/sources/xml_transaction_source";

const FILE_1_PATH = path.join(
  __dirname,
  "../../data/example_transactions_1.xml"
);

describe("Get transactions from a xml file", () => {
  test("expected read transactions from xml successfully", async () => {
    const source = new XmlTransactionSource({
      filePath: FILE_1_PATH,
    });

    const data = source.getAll();

    // FIXME: To speed development I only tested for successful parsing
    const next1 = await data.next();
    expect(next1.value.type).toBe("success");

    const next2 = await data.next();
    expect(next2.value.type).toBe("success");
  });
});
