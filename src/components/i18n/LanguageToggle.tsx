"use client";

import { useTranslation } from "./LocaleProvider";
import { LOCALES } from "@/lib/i18n/types";
import type { Locale, TranslationKey } from "@/lib/i18n/types";

const SHORT_LABEL: Record<Locale, TranslationKey> = {
  "pt-BR": "language.ptBR.short",
  en: "language.en.short",
};

const FULL_LABEL: Record<Locale, TranslationKey> = {
  "pt-BR": "language.ptBR",
  en: "language.en",
};

/**
 * PT | EN switch. Two real buttons rather than a dropdown: with only two options
 * a select costs an extra tap and hides the alternative behind it.
 *
 * No flags — a flag names a country, not a language, and Portuguese is not
 * Portugal here.
 */
export function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div
      className="border-border inline-flex items-center rounded-control border p-0.5"
      role="group"
      aria-label={t("language.label")}
    >
      {LOCALES.map((option) => {
        const isActive = option === locale;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={isActive}
            // The short label is what is shown; the full language name is what
            // gets announced, since "PT" is not a word.
            aria-label={t(FULL_LABEL[option])}
            className={[
              "cursor-pointer rounded-control px-2.5 py-1 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-white"
                : "text-muted hover:text-ink hover:bg-primary-soft",
            ].join(" ")}
          >
            {t(SHORT_LABEL[option])}
          </button>
        );
      })}
    </div>
  );
}
