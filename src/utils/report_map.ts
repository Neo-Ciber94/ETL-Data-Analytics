import { Report } from "../validations/report_schema.js";
import { TransactionType } from "../validations/transaction_type_schema.js";

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
  private readonly reports = new Map<string, Report>();

  /**
   * Adds or update a report using the given transaction information.
   * @param transaction The transaction to add.
   */
  post(transaction: TransactionSummary) {
    const company = transaction.company;
    let report = this.reports.get(company);

    if (report == null) {
      report = {
        name: company,
        username: company,
        buy_count: 0,
        sell_count: 0,
        total_stock: 0,
        max_investment: 0,
        min_investment: Number.POSITIVE_INFINITY,
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

    this.reports.set(company, report);
  }

  /**
   * Get all the generated reports.
   */
  getAll() {
    return Array.from(this.reports.values());
  }
}
