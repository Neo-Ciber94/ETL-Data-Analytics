import { test, describe, expect, beforeAll } from "vitest";
import { CsvTransactionSource } from "../../../src/services/sources/csv_transaction_source";
import { CsvTransaction } from "../../../src/validations/csv_transaction_schema";
import fs from "fs/promises";
import path from "path";
import { ensureDir } from "fs-extra";
import os from "os";

const TRANSACTIONS = [
  {
    total: 123392.1429365861426177275462,
    email: "calvinwhite@yahoo.com",
    date: 1231200000000,
    total_stock: 5242,
    company: "adbe",
    stock_price: 23.539134478555158835888505564071238040924072265625,
    transaction_type: "SELL",
  },
  {
    total: 135392.14293658177275462,
    email: "calvinwhite@yahoo.com",
    date: 1251400000000,
    total_stock: 2454,
    company: "adbe",
    stock_price: 23.544785583588850913564515856012380407226532540792,
    transaction_type: "BUY",
  },
] as const;

const FILE_1_PATH = path.join(
  __dirname,
  "../../data/example_transactions_1.csv"
);
const FILE_2_PATH = path.join(
  __dirname,
  "../../data/example_transactions_2.csv"
);

async function writeJsonAsCsvFile(filePath: string, items: readonly unknown[]) {
  const SEPARATOR = ",";
  const headers = Object.keys(items[0]!);

  const dir = path.dirname(filePath);
  await ensureDir(dir);

  const rows: string[] = [];
  rows.push(headers.join(SEPARATOR));

  for (const obj of items) {
    const values = Object.values(obj!).map((s) => String(s));
    rows.push(values.join(SEPARATOR));
  }

  const content = rows.join(os.EOL);
  await fs.writeFile(filePath, content, "utf8");
}

beforeAll(async () => {
  // Create file 1
  await writeJsonAsCsvFile(FILE_1_PATH, TRANSACTIONS);

  // Create file 2
  const copy = TRANSACTIONS.map((obj) => ({ ...obj })); // 'deep' copy array

  // Create an invalid record
  // @ts-ignore
  delete copy[0].email;
  await writeJsonAsCsvFile(FILE_2_PATH, copy);
});

describe("Get transactions from a csv file", () => {
  test("expected to read file successfully", async () => {
    const item1 = {
      company: TRANSACTIONS[0].company,
      date: new Date(TRANSACTIONS[0].date),
      email: TRANSACTIONS[0].email,
      stock_price: TRANSACTIONS[0].stock_price,
      total: TRANSACTIONS[0].total,
      total_stock: TRANSACTIONS[0].total_stock,
      transaction_type: TRANSACTIONS[0].transaction_type.toLowerCase(),
    };

    const item2 = {
      company: TRANSACTIONS[1].company,
      date: new Date(TRANSACTIONS[1].date),
      email: TRANSACTIONS[1].email,
      stock_price: TRANSACTIONS[1].stock_price,
      total: TRANSACTIONS[1].total,
      total_stock: TRANSACTIONS[1].total_stock,
      transaction_type: TRANSACTIONS[1].transaction_type.toLowerCase(),
    } as CsvTransaction;

    const source = new CsvTransactionSource({ filePath: FILE_1_PATH });
    const data = source.stream();

    const first = await data.next();
    expect(first.value.type).toBe("success");
    expect(first.value.data).toStrictEqual(item1);

    const second = await data.next();
    expect(second.value.type).toBe("success");
    expect(second.value.data).toStrictEqual(item2);
  });

  test("expected to read file failing", async () => {
    const source = new CsvTransactionSource({ filePath: FILE_2_PATH });

    const data = source.stream();

    const first = await data.next();
    expect(first.value.type).toStrictEqual("error");
  });

  test("expected file not found", async () => {
    const source = new CsvTransactionSource({
      filePath: `this_file_should_not_exists_${Date.now()}.csv`,
    });

    const process = async () => {
      const data = source.stream();
      for await (const _ of data) {
        // nothing
      }
    };

    await expect(process).rejects.toThrow();
  });
});
