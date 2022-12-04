import { winstonLogger } from "./winston.logger.js";

/**
 * Provides methods for a logger.
 */
export interface Logger {
  debug(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
}

/**
 * A logger that logs no information.
 */
export const nullLogger: Logger = {
  debug: () => {},
  info: () => {},
  error: () => {},
  warn: () => {},
};

/**
 * Returns the default logger.
 */
export function getLogger(): Logger {
  return winstonLogger;
}
