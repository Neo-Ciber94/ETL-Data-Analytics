module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    // "plugin:import/errors",
    // "plugin:import/warnings",
    // "plugin:import/javascript",
    //"plugin:import/typescript",
  ],
  overrides: [
    {
      files: ["./src/**/*.ts"],
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "require-await": "off",
    "@typescript-eslint/require-await": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-floating-promises": ["error"],
  },
  settings: {
    "import/extensions": [".js", ".jsx"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        project: "./",
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        moduleDirectory: ["node_modules", "src/"],
      },
    },
  },
};
