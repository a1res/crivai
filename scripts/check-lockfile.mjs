/**
 * Checks that package-lock.json is complete for *every* platform, not just this one.
 *
 * Why this exists: the lock file is generated on Windows, and npm does not walk
 * into the dependencies of packages it will never install here — notably the
 * `*-wasm32-wasi` fallbacks of the build tooling. On the Linux CI runner npm does
 * walk them, finds requirements the lock never recorded, and `npm ci` refuses to
 * continue with "Missing: X from lock file".
 *
 * That failure is invisible locally: `npm ci` passes on Windows every time, and
 * even `npm ci --dry-run --os=linux` does not reproduce it. It cost two deploys
 * before being understood, so it gets a guard rather than a comment.
 *
 * The check walks every package in the lock and confirms each of its declared
 * dependencies is satisfied by an entry in the same lock — the same question npm
 * asks on the runner.
 *
 * Runs as part of `npm run check`.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import semver from "semver";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
const packages = lock.packages ?? {};

/**
 * Overrides rewrite what a package is allowed to ask for, so they have to be
 * applied here too — otherwise a pinned nested version reads as unsatisfied when
 * npm would in fact resolve it to the overridden one.
 *
 * They are read from package.json: the lock file does not record them.
 */
const overrides =
  JSON.parse(readFileSync(join(root, "package.json"), "utf8")).overrides ?? {};

/**
 * Resolves a dependency the way Node does: nearest node_modules first, walking
 * up towards the root.
 */
function resolveFrom(fromPath, name) {
  let prefix = fromPath;
  for (;;) {
    const candidate =
      prefix === "" ? `node_modules/${name}` : `${prefix}/node_modules/${name}`;
    const found = packages[candidate];
    if (found !== undefined) return found;
    if (prefix === "") return undefined;
    const cut = prefix.lastIndexOf("/node_modules/");
    prefix = cut === -1 ? "" : prefix.slice(0, cut);
  }
}

const problems = [];

for (const [path, entry] of Object.entries(packages)) {
  const deps = entry.dependencies;
  if (deps === undefined) continue;

  for (const [name, declared] of Object.entries(deps)) {
    const range =
      typeof overrides[name] === "string" ? overrides[name] : declared;
    const resolved = resolveFrom(path, name);
    const owner = path === "" ? "(root)" : path.replace("node_modules/", "");

    if (resolved === undefined) {
      problems.push(
        `${owner} needs ${name}@${range}, but the lock has no entry for it`,
      );
      continue;
    }
    // Ranges npm cannot express in semver (git URLs, aliases) are skipped
    // rather than guessed at.
    if (semver.validRange(range) === null) continue;
    if (
      resolved.version !== undefined &&
      !semver.satisfies(resolved.version, range)
    ) {
      problems.push(
        `${owner} needs ${name}@${range}, but the lock only has ${name}@${resolved.version}`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error("Lock file is incomplete — `npm ci` will fail on CI:");
  for (const problem of [...new Set(problems)]) console.error(`  - ${problem}`);
  console.error(
    "\nUsually fixed by declaring the missing package as a direct devDependency,\n" +
      "so npm cannot prune it on a platform where nothing reaches it.",
  );
  process.exit(1);
}

console.log(
  `Lock file OK: ${Object.keys(packages).length} packages, all dependencies satisfiable.`,
);
