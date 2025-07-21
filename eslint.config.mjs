import next from "eslint-config-next";
import pluginImport from "eslint-plugin-import";

export default [
  next["core-web-vitals"],
  {
    plugins: {
      import: pluginImport,
    },
    rules: {
      "import/no-anonymous-default-export": [
        "error",
        {
          allowArray: true,
          allowArrowFunction: true,
          allowAnonymousClass: true,
          allowAnonymousFunction: true,
          allowLiteral: true,
          allowObject: true,
          allowNew: true,
        },
      ],
    },
  },
];
