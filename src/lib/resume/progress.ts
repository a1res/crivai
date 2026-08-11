import { useResumeStore } from "./store";
import type { Resume } from "./schema";

/**
 * How much of the resume has been filled in.
 *
 * A section counts as started, not as finished. Judging quality is the job of
 * the ATS checklist in Phase 4, which can also explain itself; a progress bar
 * that silently decides an entry is "not good enough" would just be confusing.
 *
 * Review is excluded from the total: it is where the user exports and clears,
 * not something to fill in, and counting it would cap the bar at 7 of 8 forever.
 */

const hasText = (value: string) => value.trim() !== "";

const CHECKS: ReadonlyArray<(resume: Resume) => boolean> = [
  (resume) => hasText(resume.identification.fullName),
  (resume) => hasText(resume.summary),
  (resume) =>
    resume.experiences.some(
      (entry) => hasText(entry.role) || hasText(entry.company),
    ),
  (resume) =>
    resume.education.some(
      (entry) => hasText(entry.institution) || hasText(entry.course),
    ),
  (resume) => resume.skills.some((entry) => hasText(entry.name)),
  (resume) => resume.languages.some((entry) => hasText(entry.name)),
  (resume) =>
    resume.projects.some((entry) => hasText(entry.name)) ||
    resume.certifications.some((entry) => hasText(entry.name)) ||
    resume.volunteering.some((entry) => hasText(entry.organization)),
];

export const PROGRESS_TOTAL = CHECKS.length;

export function countStartedSections(resume: Resume): number {
  return CHECKS.filter((check) => check(resume)).length;
}

/**
 * Subscribes to the count, not to the resume — the selector returns a number, so
 * the navigation re-renders when the tally changes rather than on every
 * keystroke.
 */
export function useStartedSections(): number {
  return useResumeStore((state) => countStartedSections(state.resume));
}
