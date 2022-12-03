import { Report } from "../model/report";
import { TransactionType } from "../validations/transaction_type_schema";

export interface TransactionInfo {
  type: TransactionType;
  total_stock: number;
  total_amount: number;
}

/**
 * An in memory map to build reports.
 */
export class LocalReportMap {
  private readonly map = new Map<string, Report>();

  addOrUpdate(company: string, t: TransactionInfo) {
    let report = this.map.get(company);

    if (report == null) {
      report = {
        name: company,
        username: company,
        buy_count: 0,
        sell_count: 0,
        total_stock: 0,
        max_investment: 0,
        min_investment: 0,
      };
    }

    switch (t.type) {
      case "buy":
        report.buy_count += t.total_stock;
        report.total_stock += t.total_stock;

        // I'm considering an investment when is buying
        report.max_investment = Math.max(report.max_investment, t.total_amount);
        report.min_investment = Math.min(report.min_investment, t.total_amount);
        break;
      case "sell":
        report.sell_count += t.total_stock;
        report.total_stock -= t.total_stock;
        break;
    }
  }

  values() {
    return Array.from(this.map.values());
  }
}
