import { test, describe, expect } from "vitest";
import { JsonTransactionSource } from "../../../src/services/sources/json_transaction_source";
import { JsonTransactionConsumer } from "../../../src/services/consumers/json_transaction_consumer";
import { Report } from "../../../src/validations/report_schema";
import { CustomerRepository } from "../../../src/repositories/customer.repository";
import { prismaClient } from "../../../src/db/sql/client.prisma";
import { Stream } from "../../../src/utils/streams";

const ENDPOINT = "https://softrizon.com/wp-content/uploads/ch/group-b.json";

/*
FIRST 2 RECORDS in JSON
{
  "amount": 6392,
  "price": "30.62748045619260750527246273122727870941162109375",
  "total": "195770.8550759831471737015818",
  "account_id": 692687,
  "date": "2015/12/31T00:00:00.000Z",
  "transaction_code": "buy",
  "symbol": "TEAM"
},{
  "amount": 622,
  "price": "19.1257961102681264264901983551681041717529296875",
  "total": "11896.24518058677463727690338",
  "account_id": 692687,
  "date": "2006/06/01T00:00:00.000Z",
  "transaction_code": "sell",
  "symbol": "MSFT"
}
*/

describe("Gets data from a JSON source and process it", () => {
  test("expected to get a report from the extracted json", async () => {
    // Load transactions
    const source = new JsonTransactionSource({ url: ENDPOINT });
    const transactions = Stream.take(source.stream(), 2);

    // Process transactions
    // TODO: Use `testcontainers` insteadhttps://www.npmjs.com/package/testcontainers
    const customerRepository = new CustomerRepository({
      client: prismaClient,
    });
    const consumer = new JsonTransactionConsumer({
      customerRepository,
    });
    const results = consumer.process(transactions);

    const result1 = await results.next();
    const value = result1.value;
    expect(value.type).toBe("success");
    expect(value.data).toStrictEqual({
      name: "Ashley Little",
      username: "bobby06",
      max_investment: 195770.8550759831471737015818,
      min_investment: 195770.8550759831471737015818,
      total_stock: 5770,
      sell_count: 1,
      buy_count: 1,
    } as Report);

    const result2 = await results.next();
    expect(result2.done).toBeTruthy();
  });
});
