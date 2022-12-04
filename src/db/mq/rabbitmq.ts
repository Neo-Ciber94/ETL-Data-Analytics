import amqplib from "amqplib";

export const messageQueue = await amqplib.connect(process.env.RABBITMQ_URL);
