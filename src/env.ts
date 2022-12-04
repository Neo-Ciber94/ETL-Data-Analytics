import path from "path";
import * as dotenv from "dotenv";

dotenv.config({
  path: path.join(process.cwd(), ".env.local"),
  debug: true,
});

export function isDevelopment() {
  return process.env.ENV === "development";
}

export function isContainerized() {
  return process.env.CONTAINERIZED === "true";
}
