import { Report } from "../model/report";
import { TransactionType } from "../validations/transaction_type_schema";

export interface TransactionSummary {
  company: string;
  type: TransactionType;
  total_amount: number;
  total_stock: number;
}

/**
 * An in memory map to build reports.
 */
export class LocalReportMap {
  private readonly map = new Map<string, Report>();

  /**
   * Adds or update a report using the given transaction information.
   * @param transaction The transaction to add.
   */
  post(transaction: TransactionSummary) {
    const company = transaction.company;
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

    switch (transaction.type) {
      case "buy":
        report.buy_count += 1;
        report.total_stock += transaction.total_stock;

        // I'm considering an investment only when is buying
        report.max_investment = Math.max(
          report.max_investment,
          transaction.total_amount
        );
        report.min_investment = Math.min(
          report.min_investment,
          transaction.total_amount
        );
        break;
      case "sell":
        report.sell_count += 1;
        report.total_stock -= transaction.total_stock;
        break;
    }
  }

  /**
   * Get all the generated reports.
   */
  getAll() {
    return Array.from(this.map.values());
  }
}
