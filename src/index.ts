// Import env first
import "./env.js";
import { etlRouter } from "./routes/etl.route.js";
import express from "express";
import morgan from "morgan";
import { getLogger } from "./logging/logger.js";

const logger = getLogger();
const port = process.env.PORT || 5080;
const app = express();

app.use(morgan("dev"));
app.use("/etl", etlRouter);

app.get("/now", (_req, res) => {
  res.json({
    date: new Date().toISOString(),
  });
});

app.listen(port, () => {
  logger.debug(`Listening on ${port}`);
});
