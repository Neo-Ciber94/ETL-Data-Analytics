import { Logger } from "../logging/logger.js";
import { queueKeys } from "../config/queues.js";
import { connectToQueue } from "../db/mq/rabbitmq.js";
import {
  messageQueueReportConsumer,
  messageQueueErrorsConsumer,
} from "./mq_consumers.js";
import { ReportRepository } from "../repositories/report.repository.js";

export default async function initMessageQueueConsumers(logger: Logger) {
  const conn = await connectToQueue();
  const mqChannel = await conn.createChannel();
  const reportRepository = new ReportRepository();

  await mqChannel.consume(
    queueKeys.queue.insights,
    messageQueueReportConsumer(logger, reportRepository),
  );

  await mqChannel.consume(
    queueKeys.queue.errors,
    messageQueueErrorsConsumer(logger)
  );
}
