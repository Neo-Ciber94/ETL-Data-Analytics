import amqplib from "amqplib";

/**
 * Connects to the rabbitmq server.
 * @returns A connection of the rabbitmq.
 */
export function connectToQueue() {
  return amqplib.connect(process.env.RABBITMQ_URL);
}
