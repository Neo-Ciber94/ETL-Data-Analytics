import { defineConfig } from "vitest/config";

const isRunningOnGithubAction = process.env.GITHUB_ACTIONS === "true";
const testToExclude = isRunningOnGithubAction
  ? ["**/tests/integration_tests/services/extract_transform_json_2.test.ts"]
  : [];

export default defineConfig({
  test: {
    dir: "./tests/",
    exclude: [...testToExclude],
  },
});
