"use client";

import { useTranslation } from "@/components/i18n/LocaleProvider";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { PROGRESS_TOTAL, useStartedSections } from "@/lib/resume/progress";
import { RESUME_SECTIONS } from "@/lib/sections";

/**
 * Anchor list for the form's sections, alongside overall progress.
 *
 * These are ordinary fragment links, so they keep working with JavaScript still
 * loading, and the browser handles the scrolling.
 */
export function SectionNav() {
  const { t } = useTranslation();
  const done = useStartedSections();

  return (
    <nav aria-label={t("nav.label")} className="flex flex-col gap-4">
      <ProgressIndicator done={done} total={PROGRESS_TOTAL} />

      <ul className="flex flex-col gap-0.5">
        {RESUME_SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-muted hover:bg-primary-soft hover:text-primary rounded-control block px-2 py-1.5 text-sm transition-colors"
            >
              {t(section.titleKey)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
