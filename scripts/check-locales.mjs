/**
 * Guards the translation dictionaries against the failures TypeScript cannot see.
 *
 * The type system already proves both dictionaries hold the same keys (see
 * src/lib/i18n/types.ts). It cannot inspect the strings themselves, so this
 * covers two silent breakages:
 *
 *   - an empty value, which renders as nothing at all in one language;
 *   - mismatched interpolation placeholders, e.g. "{done} de {total}" in pt-BR
 *     against "{count} of {total}" in English. That one fails only in the
 *     language nobody tested, leaving a literal "{count}" on screen.
 *
 * Runs as part of `npm run check`.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const localesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "locales",
);

const read = (file) => JSON.parse(readFileSync(join(localesDir, file), "utf8"));

const placeholders = (value) =>
  [...value.matchAll(/\{(\w+)\}/g)]
    .map((match) => match[1])
    .sort()
    .join(",");

const reference = read("pt-BR.json");
const others = { en: read("en.json") };

const problems = [];

for (const [locale, dictionary] of Object.entries(others)) {
  for (const [key, referenceValue] of Object.entries(reference)) {
    const value = dictionary[key];

    if (value === undefined) {
      problems.push(`${locale}: missing key "${key}"`);
      continue;
    }
    if (value.trim() === "") {
      problems.push(`${locale}: empty value for "${key}"`);
    }
    if (placeholders(referenceValue) !== placeholders(value)) {
      problems.push(
        `${locale}: placeholders differ for "${key}" — pt-BR has {${placeholders(referenceValue)}}, ${locale} has {${placeholders(value)}}`,
      );
    }
  }

  for (const key of Object.keys(dictionary)) {
    if (!(key in reference)) {
      problems.push(`${locale}: key "${key}" has no pt-BR counterpart`);
    }
  }
}

if (reference["app.name"] === undefined) {
  problems.push("pt-BR: dictionary looks empty");
}

if (problems.length > 0) {
  console.error("Locale check failed:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `Locales OK: ${Object.keys(reference).length} keys, ${Object.keys(others).length + 1} languages.`,
);
