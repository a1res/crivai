import { resumeSchema } from "./schema";
import type { Resume } from "./schema";

/**
 * Saving the resume to the browser, and nothing else.
 *
 * Crivai is local-first: the resume lives in the user's browser and there is no
 * database of resumes to leak (CLAUDE.md § 5). This is written by hand rather
 * than with a persistence middleware so that what gets written to someone's disk
 * is explicit and auditable — in an application whose promise is "your data
 * stays with you", that is not an implementation detail.
 *
 * Exactly one key is written, holding exactly one thing: the resume.
 */

export const STORAGE_KEY = "crivai.resume.v1";

/** Bumped when the stored shape changes in a way older saves cannot satisfy. */
const STORAGE_VERSION = 1;

const SAVE_DEBOUNCE_MS = 600;

interface StoredEnvelope {
  version: number;
  savedAt: string;
  resume: unknown;
}

export type LoadResult =
  | { status: "empty" }
  | { status: "restored"; resume: Resume; savedAt: string }
  | { status: "discarded" };

/**
 * Reads a previous session.
 *
 * Anything unreadable — corrupted, hand-edited, or written by a future version —
 * is reported as discarded rather than thrown. Losing a draft is bad; a blank
 * screen where the site used to be is worse, and unrecoverable for the user.
 */
export function loadResume(): LoadResult {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { status: "empty" };
  }

  if (raw === null) return { status: "empty" };

  try {
    const envelope = JSON.parse(raw) as StoredEnvelope;
    if (envelope.version !== STORAGE_VERSION) return { status: "discarded" };

    const parsed = resumeSchema.safeParse(envelope.resume);
    if (!parsed.success) return { status: "discarded" };

    return {
      status: "restored",
      resume: parsed.data,
      savedAt: envelope.savedAt,
    };
  } catch {
    return { status: "discarded" };
  }
}

export type SaveOutcome = "saved" | "quota-exceeded" | "unavailable";

export function saveResume(resume: Resume): SaveOutcome {
  const envelope: StoredEnvelope = {
    version: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    resume,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    return "saved";
  } catch (error) {
    // Storage can be full, or unavailable in private mode. Either way the user
    // has to be told: silently failing to save is how someone loses an
    // afternoon's work believing it was kept.
    const isQuota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED");
    return isQuota ? "quota-exceeded" : "unavailable";
  }
}

export function clearStoredResume(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored means nothing to clear.
  }
}

/**
 * Debounced saver.
 *
 * Writing on every keystroke would serialise the whole document dozens of times
 * a second. Waiting for a pause is both cheaper and enough: the gap between the
 * last keystroke and closing a tab is far longer than this.
 */
export function createDebouncedSaver(
  onOutcome: (outcome: SaveOutcome) => void,
): { save: (resume: Resume) => void; flush: () => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: Resume | null = null;

  const write = () => {
    if (pending === null) return;
    const resume = pending;
    pending = null;
    timer = null;
    onOutcome(saveResume(resume));
  };

  return {
    save(resume) {
      pending = resume;
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(write, SAVE_DEBOUNCE_MS);
    },
    flush() {
      if (timer !== null) clearTimeout(timer);
      write();
    },
    cancel() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
      pending = null;
    },
  };
}
