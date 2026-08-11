"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "@/components/i18n/LocaleProvider";
import { createDebouncedSaver, loadResume } from "@/lib/resume/persistence";
import { useResumeStore } from "@/lib/resume/store";

/**
 * Restores the previous session and keeps saving as the user types.
 *
 * Restoring happens after mount, for the same reason the language does: the site
 * is a static export, so the HTML is built with an empty form. Filling it during
 * render would make the first client render disagree with that markup and break
 * hydration.
 *
 * Renders nothing. What the user sees is in StorageNotice.
 */
export function AutoSave() {
  const started = useRef(false);

  useEffect(() => {
    // React runs effects twice in development Strict Mode. Loading twice would
    // be harmless, but subscribing twice would double every save.
    if (started.current) return;
    started.current = true;

    const store = useResumeStore.getState();

    const loaded = loadResume();
    if (loaded.status === "restored") {
      // touched: false — restoring is not an edit, so it must not immediately
      // trigger a save that rewrites what was just read.
      store.replaceResume(loaded.resume, { touched: false });
      store.setRestoredAt(loaded.savedAt);
    }

    const saver = createDebouncedSaver((outcome) => {
      useResumeStore
        .getState()
        .setStorageProblem(outcome === "saved" ? null : outcome);
    });

    const unsubscribe = useResumeStore.subscribe((state, previous) => {
      if (!state.touched) return;
      if (state.resume === previous.resume) return;
      saver.save(state.resume);
    });

    // A debounce that has not fired yet is lost work if the tab goes away.
    // pagehide covers closing and navigating; visibilitychange covers switching
    // apps on a phone, where the tab is often frozen and never gets pagehide.
    const flush = () => saver.flush();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") saver.flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      unsubscribe();
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
      saver.flush();
    };
  }, []);

  return null;
}

/** Tells the user when work was recovered, or when saving is failing. */
export function StorageNotice() {
  const { t } = useTranslation();
  const restoredAt = useResumeStore((state) => state.restoredAt);
  const problem = useResumeStore((state) => state.storageProblem);
  const setRestoredAt = useResumeStore((state) => state.setRestoredAt);

  if (problem !== null) {
    return (
      <p
        role="alert"
        className="border-warning/30 bg-warning-soft text-warning rounded-card border px-4 py-3 text-sm"
      >
        {problem === "quota-exceeded"
          ? t("storage.full")
          : t("storage.unavailable")}
      </p>
    );
  }

  if (restoredAt === null) return null;

  return (
    <div className="border-border bg-surface text-muted rounded-card flex flex-wrap items-center justify-between gap-2 border px-4 py-3 text-sm">
      <span>{t("storage.restored")}</span>
      <button
        type="button"
        onClick={() => setRestoredAt(null)}
        className="text-primary cursor-pointer underline"
      >
        {t("storage.dismiss")}
      </button>
    </div>
  );
}
