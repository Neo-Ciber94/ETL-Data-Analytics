import { Logger } from "../logging/logger.js";
import { queueKeys } from "../config/queues.js";
import { messageQueue } from "../db/mq/rabbitmq.js";
import {
  messageQueueReportConsumer,
  messageQueueErrorsConsumer,
} from "./mq_consumers.js";

export default async function initMessageQueueConsumers(logger: Logger) {
  const mqChannel = await messageQueue.createChannel();

  await mqChannel.consume(
    queueKeys.queue.insights,
    messageQueueReportConsumer(logger)
  );

  await mqChannel.consume(
    queueKeys.queue.errors,
    messageQueueErrorsConsumer(logger)
  );
}
