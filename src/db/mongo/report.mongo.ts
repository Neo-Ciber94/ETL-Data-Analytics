import mongoose from "mongoose";
import { Report } from "../../validations/report_schema.js";

export const reportMongoSchema = new mongoose.Schema<Report>({
  name: { type: String, required: true },
  username: { type: String, required: true },
  sell_count: { type: Number, required: true },
  buy_count: { type: Number, required: true },
  min_investment: { type: Number, required: true },
  max_investment: { type: Number, required: true },
  total_stock: { type: Number, required: true },
});

export const ReportModel: mongoose.Model<Report> =
  mongoose.models["Report"] || mongoose.model("Report", reportMongoSchema);
