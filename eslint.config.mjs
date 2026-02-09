import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: Object.fromEntries(
      Object.keys({
        ...nextVitals.reduce((a, c) => ({ ...a, ...c.rules }), {}),
        ...nextTs.reduce((a, c) => ({ ...a, ...c.rules }), {}),
      }).map((rule) => [rule, "off"]),
    ),
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
