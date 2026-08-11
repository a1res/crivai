"use client";

import { useTranslation } from "@/components/i18n/LocaleProvider";
import { SectionNav } from "@/components/layout/SectionNav";
import { Card } from "@/components/ui/Card";
import { RESUME_SECTIONS } from "@/lib/sections";

/*
 * Layout decision: one page with anchored sections, not a step-by-step wizard.
 *
 * Phase 3 puts a live preview of the resume beside the form, so the user watches
 * the document take shape while typing. A wizard would break the form into
 * screens and cut exactly that feedback loop, and it would also hide how much is
 * left — the section list and progress bar say that at a glance instead.
 *
 * The fields themselves arrive in Phase 2; this is the shell.
 */
export default function Home() {
  const { t } = useTranslation();

  return (
    <main id="conteudo" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("app.name")}
        </h1>
        <p className="text-muted mt-3 text-lg text-balance">
          {t("app.tagline")}
        </p>
        <p className="text-subtle mt-2 text-sm">{t("app.status")}</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        <div className="lg:sticky lg:top-20 lg:w-56 lg:shrink-0">
          <SectionNav />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {RESUME_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              // Clears the sticky header when jumped to from the nav, so the
              // heading is not hidden underneath it.
              className="scroll-mt-20"
              aria-labelledby={`${section.id}-title`}
            >
              <Card>
                <h2
                  id={`${section.id}-title`}
                  className="text-ink text-xl font-semibold"
                >
                  {t(section.titleKey)}
                </h2>
                <p className="text-muted mt-1 text-sm">
                  {t(section.descriptionKey)}
                </p>
                <p className="border-border text-subtle mt-4 border-t pt-4 text-sm">
                  {t("section.placeholder")}
                </p>
              </Card>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
