import { Report } from "../validations/report_schema.js";
import { TransactionType } from "../validations/transaction_type_schema.js";

export interface TransactionSummary {
  type: TransactionType;
  total_amount: number;
  total_stock: number;
  customer: {
    name: string;
    username: string;
  };
}

/**
 * An in memory map to build reports.
 */
export class LocalCustomerInsightReport {
  private readonly customerReports = new Map<string, Report>();

  /**
   * Adds or update a report using the given transaction information.
   * @param transaction The transaction to add.
   */
  post(transaction: TransactionSummary) {
    let report = this.customerReports.get(transaction.customer.username);

    if (report == null) {
      report = {
        name: transaction.customer.name,
        username: transaction.customer.username,
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

    this.customerReports.set(transaction.customer.username, report);
  }

  /**
   * Get all the generated reports.
   */
  reports() {
    // map to deep copy the data and not just the reference.
    return Array.from(this.customerReports.values()).map((obj) => ({ ...obj }));
  }
}
