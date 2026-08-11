"use client";

import { useTranslation } from "@/components/i18n/LocaleProvider";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { RESUME_SECTIONS } from "@/lib/sections";

export interface SectionNavProps {
  /** Sections considered filled in. Wired to real data in Phase 2. */
  done?: number;
}

/**
 * Anchor list for the form's sections, alongside overall progress.
 *
 * These are ordinary fragment links, so they keep working with JavaScript still
 * loading, and the browser handles the scrolling.
 */
export function SectionNav({ done = 0 }: SectionNavProps) {
  const { t } = useTranslation();

  return (
    <nav aria-label={t("nav.label")} className="flex flex-col gap-4">
      <ProgressIndicator done={done} total={RESUME_SECTIONS.length} />

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
