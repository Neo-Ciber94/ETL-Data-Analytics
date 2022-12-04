// Configure env first
import "./env.js";
// Configure env first

import express from "express";
import morgan from "morgan";
import { etlRouter } from "./routes/etl.route.js";
import { getLogger } from "./logging/logger.js";
import { prismaClient } from "./db/sql/client.prisma.js";
import initMessageQueueConsumers from "./mq/init";
import { MongoClient } from "./db/mongo/client.mongo.js";

const logger = getLogger();
const port = process.env.PORT || 5001;
const app = express();

await MongoClient.connect();
logger.debug("mongo client initialized");

// Start message queue consumers
await initMessageQueueConsumers(logger);

// Middlewares
app.use(morgan("dev"));

// Endpoints
app.use("/etl", etlRouter);

app.get("/now", (_req, res) => {
  res.json({
    date: new Date().toISOString(),
  });
});

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

app.listen(port, () => {
  logger.debug(`Listening on ${port}`);
});
