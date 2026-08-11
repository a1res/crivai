import ptBR from "@/locales/pt-BR.json";
import en from "@/locales/en.json";

export const LOCALES = ["pt-BR", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * The site always opens in pt-BR, regardless of the browser's language
 * (CLAUDE.md § 1). Switching to English is an explicit user action.
 */
export const DEFAULT_LOCALE: Locale = "pt-BR";

export const LOCALE_STORAGE_KEY = "crivai.locale";

/**
 * Keys are derived from the pt-BR dictionary, which is therefore the reference
 * for what strings exist at all.
 */
export type TranslationKey = keyof typeof ptBR;

export type Dictionary = Record<TranslationKey, string>;

/**
 * Values interpolated into a string, as in "{done} of {total} sections".
 *
 * Only ever numbers or already-translated fragments. Never a bare noun: in
 * Portuguese the article agrees with the noun's gender ("outra experiência" but
 * "outro projeto"), so a sentence built by slotting a noun into a template comes
 * out wrong. Those strings live in the dictionary whole — see
 * "section.experience.add" versus "section.extras.add".
 */
export type TranslationValues = Record<string, string | number>;

/**
 * Compile-time proof that the two dictionaries hold exactly the same keys.
 *
 * A key present in one and missing from the other fails `npm run check`, instead
 * of shipping and surfacing as a raw key on screen for whichever language was
 * forgotten.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ptBRCoversEn = ptBR satisfies Record<keyof typeof en, string>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _enCoversPtBR = en satisfies Record<keyof typeof ptBR, string>;

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}
