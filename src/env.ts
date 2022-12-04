import path from "path";
import * as dotenv from "dotenv";

dotenv.config({
  path: path.join(process.cwd(), "env.local"),
  debug: true,
});
