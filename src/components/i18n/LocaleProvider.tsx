"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import { translate } from "@/lib/i18n/dictionaries";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isLocale } from "@/lib/i18n/types";
import type {
  Locale,
  TranslationKey,
  TranslationValues,
} from "@/lib/i18n/types";

/*
 * The chosen language lives in localStorage, which makes it an external store,
 * so it is read through useSyncExternalStore rather than copied into state by an
 * effect.
 *
 * That choice does the hydration work for us. The site is a static export: the
 * HTML is generated in pt-BR at build time, and `getServerSnapshot` returns the
 * same pt-BR for the first client render, so the two always agree. React then
 * re-renders with the stored value. Reading storage during render instead would
 * make the markup and the first render disagree for anyone who had picked
 * English.
 *
 * Opening in pt-BR regardless of the browser's own language is not a side effect
 * of this design — it is the behaviour CLAUDE.md § 1 requires.
 */

const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  // `storage` fires in *other* tabs, so switching language in one tab follows in
  // the rest. Same-tab changes are covered by the listener set above.
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): Locale {
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). The default
    // language still works, so there is nothing to recover from.
    return DEFAULT_LOCALE;
  }
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Keeps the document language in step with the UI, so screen readers and
  // browser translation prompts see the truth.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Nothing to persist to. Without a store to read back from there is no
      // way to hold the choice, so the site stays in the default language.
      return;
    }
    for (const listener of listeners) listener();
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, values) => translate(locale, key, values),
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useTranslation(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (context === null) {
    throw new Error("useTranslation must be used inside a LocaleProvider");
  }
  return context;
}
