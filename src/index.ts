// Configure env first
import "./env.js";
// Configure env first

import express from "express";
import morgan from "morgan";
import { etlRouter } from "./routes/etl.route.js";
import { getLogger } from "./logging/logger.js";
import initMessageQueueConsumers from "./mq/init.js";
import { MongoClient } from "./db/mongo/client.mongo.js";
import { prismaClient } from "./db/sql/client.prisma.js";

const logger = getLogger();
const port = process.env.PORT || 5001;
const app = express();

// FIXME: Db connections are not resilient, a retry logic is required

// This is not necessary because the PrismaClient is lazy,
// but helps to test the connection on startup.
await prismaClient.$connect();
logger.debug("prisma client connected");

await MongoClient.connect();
logger.debug("mongo client connected");

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

app.listen(port, () => {
  logger.debug(`Listening on ${port}`);
});
