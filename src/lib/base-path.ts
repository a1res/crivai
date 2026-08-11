/**
 * The sub-path the app is served from (e.g. `/crivai`), resolved at build time
 * by next.config.ts and inlined into the bundle. Empty string when the app is
 * served from a domain root.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Prefix a path to an asset in `public/` with the base path.
 *
 * `next/link` hrefs get the base path applied automatically by Next.js, but
 * assets under `public/` do not — those must go through this helper, otherwise
 * they resolve to the domain root and 404 in production.
 */
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
