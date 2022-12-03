import createFetchMock from "vitest-fetch-mock";
import { describe, expect, test, vi } from "vitest";
import { JsonTransaction } from "../../../src/validations/transactions_validation";
import { JsonTransactionSource } from "../../../src/services/sources/json_transaction_source";

const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();

describe("Get transactions from external json file", () => {
  test("expected correctly fetch json array", async () => {
    const TRANSACTION_DATA: JsonTransaction[] = [
      {
        account_id: 123,
        amount: 100,
        price: 120,
        symbol: "AMZ",
        total: 2300,
        transaction_code: "buy",
      },
      {
        account_id: 123,
        amount: 1030,
        price: 69,
        symbol: "AMZ",
        total: 200,
        transaction_code: "sell",
      },
    ];

    fetchMock.mockIf(
      "https://softrizon.com/wp-content/uploads/ch/group-b.json",
      async () => {
        return {
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(TRANSACTION_DATA),
        };
      }
    );

    const source = new JsonTransactionSource();
    const data = source.getAll();

    // First value
    const next1 = await data.next();
    expect(next1.value).toStrictEqual(TRANSACTION_DATA[0]);

    // Second value
    const next2 = await data.next();
    expect(next2.value).toStrictEqual(TRANSACTION_DATA[1]);

    const done = (await data.next()).done;
    expect(done).toBeTruthy();
  });

  test("expected failed request", () => {
    fetchMock.mockIf(
      "https://softrizon.com/wp-content/uploads/ch/group-b.json",
      async () => {
        return {
          headers: {
            "content-type": "application/json",
          },
          status: 500,
          body: JSON.stringify({ error: "something went wrong" }),
        };
      }
    );

    const source = new JsonTransactionSource();
    expect(async () => {
      const data = source.getAll();
      await data.next();
    }).rejects.toThrow();
  });
});

fetchMock.dontMock();
