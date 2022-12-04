import { ReportModel } from "../db/mongo/report.mongo.js";
import { Report } from "../validations/report_schema.js";

export class ReportRepository {
  async getAll(): Promise<Report[]> {
    const results = await ReportModel.find();
    return results;
  }

  async create(data: Report): Promise<Report> {
    const report = new ReportModel(data);
    const result = await report.save();
    return result;
  }
}
