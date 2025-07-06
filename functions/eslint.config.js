import pluginTs from "@typescript-eslint/eslint-plugin";
import parserTs from "@typescript-eslint/parser";
import pluginImport from "eslint-plugin-import";

export default [
  {
    ignores: ["lib/**/*", "generated/**/*"],
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
