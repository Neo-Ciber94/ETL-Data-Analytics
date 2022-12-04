import amqplib from "amqplib";
import { Logger } from "../logging/logger.js";
import { ReportRepository } from "../repositories/report.repository.js";

export function messageQueueReportConsumer(
  logger: Logger,
  repository: ReportRepository
) {
  return async (msg: amqplib.ConsumeMessage | null) => {
    const buffer = msg?.content;
    if (buffer) {
      const json = buffer.toString();

      try {
        const data = JSON.parse(json);
        await repository.create(data);
      } catch (e) {
        logger.error(e);
      }
    }
  };
}

export function messageQueueErrorsConsumer(logger: Logger) {
  return (msg: amqplib.ConsumeMessage | null) => {
    const buffer = msg?.content;
    if (buffer) {
      const data = buffer.toString();
      logger.error(data);
    }
  };
}
