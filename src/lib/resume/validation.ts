import type { ZodType } from "zod";
import type { TranslationKey } from "@/lib/i18n/types";

/**
 * Turns a schema failure into a translation key.
 *
 * Validation reuses the schema pieces themselves rather than restating the rules
 * here — a second copy of "what counts as an email" is a second copy to keep in
 * step, and the one that drifts is always the one nobody is looking at.
 */

export function fieldError(
  schema: ZodType,
  value: unknown,
): TranslationKey | undefined {
  const result = schema.safeParse(value);
  if (result.success) return undefined;
  return result.error.issues[0]?.message as TranslationKey | undefined;
}

/** The error attached to one property of an entry, e.g. the end date of a job. */
export function entryError(
  schema: ZodType,
  value: unknown,
  property: string,
): TranslationKey | undefined {
  const result = schema.safeParse(value);
  if (result.success) return undefined;
  const issue = result.error.issues.find((item) => item.path[0] === property);
  return issue?.message as TranslationKey | undefined;
}
