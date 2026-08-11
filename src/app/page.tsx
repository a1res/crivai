"use client";

import type { ComponentType } from "react";
import { useTranslation } from "@/components/i18n/LocaleProvider";
import { SectionNav } from "@/components/layout/SectionNav";
import { AutoSave, StorageNotice } from "@/components/form/AutoSave";
import { EducationSection } from "@/components/form/EducationSection";
import { ExperienceSection } from "@/components/form/ExperienceSection";
import { ExtrasSection } from "@/components/form/ExtrasSection";
import { IdentificationSection } from "@/components/form/IdentificationSection";
import {
  LanguagesSection,
  SkillsSection,
} from "@/components/form/SkillsSection";
import { SummarySection } from "@/components/form/SummarySection";
import { Card } from "@/components/ui/Card";
import { RESUME_SECTIONS } from "@/lib/sections";

/*
 * Layout decision: one page with anchored sections, not a step-by-step wizard.
 *
 * Phase 3 puts a live preview of the resume beside the form, so the user watches
 * the document take shape while typing. A wizard would break the form into
 * screens and cut exactly that feedback loop, and it would also hide how much is
 * left — the section list and progress bar say that at a glance instead.
 */

const SECTION_CONTENT: Record<string, ComponentType> = {
  identificacao: IdentificationSection,
  resumo: SummarySection,
  experiencias: ExperienceSection,
  formacao: EducationSection,
  habilidades: SkillsSection,
  idiomas: LanguagesSection,
  extras: ExtrasSection,
};

export default function Home() {
  const { t } = useTranslation();

  return (
    <main id="conteudo" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <AutoSave />

      <div className="mb-8 max-w-2xl">
        <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("app.name")}
        </h1>
        <p className="text-muted mt-3 text-lg text-balance">
          {t("app.tagline")}
        </p>
      </div>

      <div className="mb-6">
        <StorageNotice />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        <div className="lg:sticky lg:top-20 lg:w-56 lg:shrink-0">
          <SectionNav />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {RESUME_SECTIONS.map((section) => {
            const Content = SECTION_CONTENT[section.id];

            return (
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
                  <p className="text-muted mt-1 mb-5 text-sm">
                    {t(section.descriptionKey)}
                  </p>

                  {Content === undefined ? (
                    <p className="border-border text-subtle border-t pt-4 text-sm">
                      {t("section.placeholder")}
                    </p>
                  ) : (
                    <Content />
                  )}
                </Card>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
