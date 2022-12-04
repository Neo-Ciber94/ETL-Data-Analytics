import path from "path";
import * as dotenv from "dotenv";

const isRunningOnContainer = process.env.CONTAINERIZED === "true";

dotenv.config({
  path: path.join(
    process.cwd(),
    isRunningOnContainer ? ".env.local.container" : ".env.local"
  ),
  debug: true,
});

export function isDevelopment() {
  return process.env.ENV === "development";
}

export function isContainerized() {
  return process.env.CONTAINERIZED === "true";
}
