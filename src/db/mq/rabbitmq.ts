import amqplib from "amqplib";

export function connectToQueue() {
  return amqplib.connect(process.env.RABBITMQ_URL);
}
