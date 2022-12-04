// Import env first
import "./env.js";
// Import env first

import express from "express";
import morgan from "morgan";
import { queueKeys } from "./config/queues.js";
import { messageQueue } from "./db/mq/rabbitmq.js";
import { etlRouter } from "./routes/etl.route.js";
import { getLogger } from "./logging/logger.js";
import { prismaClient } from "./db/sql/client.prisma.js";

const logger = getLogger();
const port = process.env.PORT || 5080;
const app = express();

const mqChannel = await messageQueue.createChannel();

await mqChannel.consume(queueKeys.queue.errors, (msg) => {
  const buffer = msg?.content;
  if (buffer) {
    const json = buffer.toString();
    logger.debug({ json });
  }
});

app.use(morgan("dev"));
app.use("/etl", etlRouter);
app.get("/customers", async (req, res) => {
  let limit = -1;

  if (typeof req.query["limit"] === "string") {
    const count = Number(req.query["limit"]);
    if (!Number.isNaN(count)) {
      limit = count;
    }
  }

  const result = await prismaClient.customers.findMany({
    take: limit > 0 ? limit : undefined,
  });

  res.json(result);
});

app.get("/now", (_req, res) => {
  res.json({
    date: new Date().toISOString(),
  });
});

app.listen(port, () => {
  logger.debug(`Listening on ${port}`);
});
