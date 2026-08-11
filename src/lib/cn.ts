/**
 * Joins class names, dropping anything falsy.
 *
 * Deliberately not a dependency: the components here compose a handful of
 * conditional classes and never need Tailwind conflict resolution.
 */
export function cn(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ");
}
