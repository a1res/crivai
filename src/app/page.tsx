/**
 * Scaffolding placeholder.
 *
 * The real interface is built in Phase 1 (design system) and Phase 2 (resume
 * form). The copy below is intentionally minimal and will be replaced by
 * translated strings once the i18n infrastructure lands in Phase 1 — no
 * user-facing text should be hardcoded in a component (CLAUDE.md § 6).
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Crivai</h1>
      <p className="text-lg text-balance opacity-80">
        Gerador de currículos gratuito, pensado para passar pelos sistemas de
        triagem automatizada (ATS) usados no Brasil — sem truques e sem
        pegadinhas.
      </p>
      <p className="text-sm opacity-60">
        Em construção. Fase 0: fundação do repositório.
      </p>
    </main>
  );
}
