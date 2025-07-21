const pluginTs = require("@typescript-eslint/eslint-plugin");
const parserTs = require("@typescript-eslint/parser");
const pluginImport = require("eslint-plugin-import");

module.exports = [
  {
    ignores: ["lib/**/*", "generated/**/*", "eslint.config.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: parserTs,
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.dev.json"],
      },
    },
    plugins: {
      "@typescript-eslint": pluginTs,
      import: pluginImport,
    },
    rules: {
      quotes: ["error", "double"],
      "import/no-unresolved": "off",
      indent: ["error", 2],
    },
  },
];
