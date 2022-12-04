import winston from "winston";
import { Logger } from "./logger";
import { isDevelopment } from "../env.js";

const { colorize, combine, timestamp, printf } = winston.format;

const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] : ${message}`;
});

export const winstonLogger: Logger = winston.createLogger({
  level: isDevelopment() ? "debug" : "warn",
  format: combine(colorize({ all: true }), timestamp(), customFormat),
  transports: [new winston.transports.Console()],
});
