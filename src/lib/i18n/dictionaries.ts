import ptBR from "@/locales/pt-BR.json";
import en from "@/locales/en.json";
import type {
  Dictionary,
  Locale,
  TranslationKey,
  TranslationValues,
} from "./types";

/**
 * Both dictionaries are bundled. They are a few kilobytes of text, and shipping
 * both means switching language is instant and works offline, with no request
 * and no flash of untranslated content.
 */
export const dictionaries: Record<Locale, Dictionary> = {
  "pt-BR": ptBR,
  en: en,
};

/** Replaces every `{name}` in the string with the matching value. */
export function interpolate(
  template: string,
  values: TranslationValues | undefined,
): string {
  if (values === undefined) return template;

  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = values[name];
    return value === undefined ? match : String(value);
  });
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  values?: TranslationValues,
): string {
  return interpolate(dictionaries[locale][key], values);
}
