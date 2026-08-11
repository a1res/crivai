/**
 * Crivai — AI backend (Cloudflare Worker).
 *
 * This Worker exists for exactly one reason: the LLM API key must never reach
 * the browser. The site itself is a static export on GitHub Pages, which has no
 * server side at all, so anything requiring a secret runs here.
 *
 * Privacy posture (CLAUDE.md section 5, research section 10):
 * - Nothing is persisted. There is no database, no KV, no cache of user data.
 *   Resume data arrives, is used to build a request to the model, and is gone.
 * - If any logging or caching is ever added, it must have a short, explicitly
 *   documented TTL, and must never include resume content or job descriptions.
 *
 * Phase 5 of TODO.md adds the real endpoint (`POST /analyze`). For now this is a
 * skeleton with a health check, so the deployment path can be validated before
 * any AI logic exists.
 */

export interface Env {
  /**
   * LLM provider API key. Set via `wrangler secret put LLM_API_KEY` — never
   * committed to the repository. Not yet used; the analysis endpoint arrives in
   * Phase 5.
   */
  LLM_API_KEY?: string;
}

/**
 * Origins allowed to call this Worker.
 *
 * The production origin is the GitHub Pages host. Note it is the *origin* only:
 * the browser never sends the `/crivai` path in the `Origin` header, so the base
 * path must not appear here.
 */
const ALLOWED_ORIGINS: readonly string[] = [
  "https://a1res.github.io",
  // Local development. Harmless in production: an attacker cannot make a
  // victim's browser claim this origin.
  "http://localhost:3000",
];

/**
 * Build CORS headers for a request.
 *
 * The allowed origin is echoed back rather than answered with `*`, because
 * later phases post resume data to this Worker and a wildcard would let any
 * site on the internet read the responses. An origin that is not on the
 * allowlist simply gets no CORS headers, and the browser blocks the response.
 */
function corsHeaders(origin: string | null): Record<string, string> {
  // `Vary` matters even when the origin is rejected, so that a cached response
  // for one origin is never reused for another.
  const headers: Record<string, string> = { Vary: "Origin" };

  if (origin !== null && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }

  return headers;
}

function json(
  body: unknown,
  init: { status?: number; origin: string | null },
): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(init.origin),
    },
  });
}

export default {
  fetch(request: Request): Response {
    const origin = request.headers.get("Origin");
    const { pathname } = new URL(request.url);

    // CORS preflight.
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (pathname === "/health") {
      if (request.method !== "GET") {
        return json({ error: "method_not_allowed" }, { status: 405, origin });
      }
      return json({ status: "ok", service: "crivai-worker" }, { origin });
    }

    return json({ error: "not_found" }, { status: 404, origin });
  },
} satisfies ExportedHandler<Env>;
