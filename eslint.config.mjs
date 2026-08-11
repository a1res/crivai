import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Must stay last: turns off every ESLint rule that would fight Prettier.
  // Formatting is Prettier's job, correctness is ESLint's.
  prettier,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The Worker is a separate package with its own toolchain — linting it with
    // the Next.js/React ruleset would only produce noise.
    "worker/**",
  ]),
]);

export default eslintConfig;
