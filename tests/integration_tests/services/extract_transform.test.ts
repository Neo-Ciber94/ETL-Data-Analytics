import { vi, test, describe, expect } from "vitest";
import createFetchMock from "vitest-fetch-mock";
import { JsonTransactionSource } from "../../../src/services/sources/json_transaction_source";
import { JsonTransaction } from "../../../src/validations/json_transaction_schema";
import { JsonTransactionConsumer } from "../../../src/services/consumers/json_transaction_consumer";
import { Report } from "../../../src/validations/report_schema";
import type { CustomerRepository } from "../../../src/repositories/customer.repository";

const ENDPOINT = "https://softrizon.com/wp-content/uploads/ch/group-b.json";

const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();

const TRANSACTION_DATA: JsonTransaction[] = [
  {
    account_id: 123,
    total: 2300,
    amount: 1000,
    price: 120,
    symbol: "amz",
    transaction_code: "buy",
  },
  {
    account_id: 123,
    total: 200,
    amount: 200,
    price: 60,
    symbol: "amz",
    transaction_code: "sell",
  },
];

describe("Gets data from a JSON source and process it", () => {
  test("expected to get a report from the extracted json", async () => {
    fetchMock.mockIf(ENDPOINT, async () => {
      return {
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(TRANSACTION_DATA),
      };
    });

    // Mock repository

    const repo: Partial<CustomerRepository> = {
      getByAccountId(_accountId) {
        return Promise.resolve({
          name: "John",
          username: "john265",
          address: "123 Main Street",
          birthdate: new Date(),
          email: "john265@gmail.com",
        });
      },
    };

    const customerRepository = repo as CustomerRepository;

    // Load transactions
    const source = new JsonTransactionSource({ url: ENDPOINT });
    const transactions = source.stream();

    // Process transactions
    const consumer = new JsonTransactionConsumer({
      customerRepository,
    });
    const results = consumer.process(transactions);

    const result1 = await results.next();
    const value = result1.value;
    expect(value.type).toBe("success");
    expect(value.data).toStrictEqual({
      name: "John",
      username: "john265",
      max_investment: 2300,
      min_investment: 2300,
      total_stock: 800,
      sell_count: 1,
      buy_count: 1,
    } as Report);

    const result2 = await results.next();
    expect(result2.done).toBeTruthy();
  });
});
