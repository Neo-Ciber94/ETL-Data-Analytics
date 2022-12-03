import createFetchMock from "vitest-fetch-mock";
import { describe, expect, test, vi } from "vitest";
import { JsonTransactionSource } from "../../../src/services/sources/json_transaction_source";
import { JsonTransaction } from "../../../src/validations/json_transaction_schema";

const ENDPOINT = "https://softrizon.com/wp-content/uploads/ch/group-b.json";

const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();

describe("Get transactions from external json file", () => {
  test("expected correctly fetch json array", async () => {
    const TRANSACTION_DATA: JsonTransaction[] = [
      {
        account_id: 123,
        amount: 100,
        price: 120,
        symbol: "amz",
        total: 2300,
        transaction_code: "buy",
      },
      {
        account_id: 123,
        amount: 1030,
        price: 69,
        symbol: "amz",
        total: 200,
        transaction_code: "sell",
      },
    ];

    fetchMock.mockIf(ENDPOINT, async () => {
      return {
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(TRANSACTION_DATA),
      };
    });

    const source = new JsonTransactionSource({ url: ENDPOINT });
    const data = source.getAll();

    // First value
    const next1 = await data.next();
    expect(next1.value.data).toStrictEqual(TRANSACTION_DATA[0]);

    // Second value
    const next2 = await data.next();
    expect(next2.value.data).toStrictEqual(TRANSACTION_DATA[1]);

    const done = (await data.next()).done;
    expect(done).toBeTruthy();
  });

  test("expected failed request", () => {
    fetchMock.mockIf(ENDPOINT, async () => {
      return {
        headers: {
          "content-type": "application/json",
        },
        status: 500,
        body: JSON.stringify({ error: "something went wrong" }),
      };
    });

    const source = new JsonTransactionSource({ url: ENDPOINT });
    expect(async () => {
      const data = source.getAll();
      await data.next();
    }).rejects.toThrow();
  });
});

fetchMock.dontMock();
