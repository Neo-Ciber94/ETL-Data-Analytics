import winston from "winston";
import { Logger } from "./logger";
const { combine, timestamp, printf } = winston.format;

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

export const winstonLogger: Logger = winston.createLogger({
  format: combine(timestamp(), customFormat),
  transports: [new winston.transports.Console()],
});
