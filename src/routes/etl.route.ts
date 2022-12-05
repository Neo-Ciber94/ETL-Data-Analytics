import { customers } from "@prisma/client";
import express from "express";
import { MemoryCache } from "../caching/memory.cache";
import { connectToQueue } from "../db/mq/rabbitmq";
import { prismaClient } from "../db/sql/client.prisma";
import { getLogger } from "../logging/logger";
import { CustomerRepository } from "../repositories/customer.repository";
import { TransactionAggregator } from "../services/aggregator/aggregator";

export const etlRouter = express.Router();

etlRouter.post("/process", async (_req, res) => {
  try {
    const mqConnection = await connectToQueue();
    const logger = getLogger();
    const client = prismaClient;
    const customerCache = new MemoryCache<customers>("customers"); // TODO: Change for redis
    const customerRepository = new CustomerRepository({
      client,
      cache: customerCache,
    });

    const aggregator = new TransactionAggregator({
      logger,
      mqConnection,
      customerRepository,
    });

    const summary = await aggregator.process();
    console.log(`${summary.count} transactions successfully processed`);

    return res.status(200).json({
      message: `${summary.count} transactions where successfully processed`,
      duration: `${summary.elapsed}ms`,
      success: true,
    });

  } catch (error) {
    return res.status(500).json({
      message: `Failed to process transactions`,
      error,
      success: false,
    });
  }
});
