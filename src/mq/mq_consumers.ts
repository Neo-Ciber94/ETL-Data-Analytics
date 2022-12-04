import amqplib from "amqplib";
import { Logger } from "../logging/logger.js";
import { ReportRepository } from "../repositories/report.repository.js";

const THRESHOLD = 1000;

export function messageQueueReportConsumer(
  logger: Logger,
  repository: ReportRepository
) {
  return async (msg: amqplib.ConsumeMessage | null) => {
    const buffer = msg?.content;
    const timestamp = msg?.properties.timestamp;

    if (timestamp && Date.now() > timestamp + THRESHOLD) {
      return;
    }

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
    const timestamp = msg?.properties.timestamp;

    if (timestamp && Date.now() > timestamp + THRESHOLD) {
      return;
    }

    if (buffer) {
      const data = buffer.toString();
      logger.error(data);
    }
  };
}
