"use client";

import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useTranslation } from "@/components/i18n/LocaleProvider";

export function SiteHeader() {
  const { t } = useTranslation();

  return (
    <header className="border-border bg-canvas/90 sticky top-0 z-20 border-b backdrop-blur">
      {/* First focusable element on the page. Someone navigating by keyboard
          should not have to tab through the whole section list to reach the
          field they were editing. */}
      <a
        href="#conteudo"
        className="bg-primary rounded-control sr-only px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-30"
      >
        {t("header.skipToContent")}
      </a>

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <span className="text-primary text-lg font-semibold tracking-tight">
          {t("app.name")}
        </span>

        {/* Fixed in the top right, visible from every section — the language
            switch must never be something the user has to go looking for. */}
        <LanguageToggle />
      </div>
    </header>
  );
}
