import type { NextConfig } from "next";

/**
 * Single source of truth for the sub-path the site is served from.
 *
 * Production lives at https://a1res.github.io/crivai/ — a sub-path of the default
 * GitHub Pages domain, not the root of a custom domain. It is kept as an
 * env-overridable constant (rather than a literal spread across the codebase) so
 * that moving to a custom domain later is a one-line change. See CLAUDE.md § 3.
 *
 * The base path is deliberately applied in development too, so the local
 * environment matches production exactly: a wrong path breaks at localhost
 * instead of failing silently only after deploy.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/crivai";

const nextConfig: NextConfig = {
  // GitHub Pages is a static host: no API Routes and no Server Actions in
  // production. Anything needing a server goes to the Cloudflare Worker.
  output: "export",

  basePath,
  assetPrefix: basePath,

  // Required by `output: 'export'` — the default image loader needs a server.
  images: { unoptimized: true },

  // Emit `/route/index.html` instead of `/route.html`, which is unambiguous on
  // any static host.
  trailingSlash: true,

  // Expose the *resolved* base path to runtime code, so the default above is not
  // duplicated anywhere else. Consumed by src/lib/base-path.ts.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },

  // `next dev` otherwise appends a vendor block to CLAUDE.md on every run.
  // CLAUDE.md is this project's hand-authored source of truth (see its header),
  // so the framework must not rewrite it. Note for whoever works here next:
  // Next.js 16 differs from most models' training data — check the bundled docs
  // in `node_modules/next/dist/docs/` rather than trusting recall.
  agentRules: false,
};

export default nextConfig;
