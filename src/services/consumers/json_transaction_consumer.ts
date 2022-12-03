import { Report } from "../../model/report.js";
import { TransactionError } from "../../model/transaction_error.js";
import { Result } from "../../utils/result.js";
import { Stream } from "../../utils/streams.js";
import { JsonTransaction } from "../../validations/json_transaction_schema.js";
import { TransactionConsumer } from "../interfaces/transaction_consumer.js";

export class JsonTransactionConsumer
  implements TransactionConsumer<JsonTransaction>
{
  async *process(
    transactions: Stream<JsonTransaction>
  ): Stream<Result<Report, TransactionError>> {
    const reports = new Map<number, Report>();

    for await (const t of transactions) {
      const key = t.account_id;
      let report: Report;
      if (reports.has(key)) {
        report = reports.get(key)!;
      } else {
        report = {
          name: t.symbol, // FIXME: This is received as uppercase, we need lower
          username: t.symbol,
          buy_count: 0,
          sell_count: 0,
          total_stock: 0,
          max_investment: 0,
          min_investment: 0,
        };
      }

      switch (t.transaction_code) {
        case "buy":
          report.buy_count += t.amount;
          report.total_stock += t.amount;

          // I'm considering an investment when is buying
          report.max_investment = Math.max(report.max_investment, t.total);
          report.min_investment = Math.min(report.min_investment, t.total);
          break;
        case "sell":
          report.sell_count += t.amount;
          report.total_stock -= t.amount;
          break;
      }

      // Save/Update the result
      reports.set(key, report);
    }

    for (const report of reports.values()) {
      yield Result.ok(report);
    }
  }
}
