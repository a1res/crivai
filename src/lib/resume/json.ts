import { resumeSchema } from "./schema";
import type { Resume } from "./schema";

/**
 * Taking the resume out of the browser, and putting it back.
 *
 * This is what makes "your data stays with you" true rather than merely stated:
 * the user can walk away with the whole document and reload it on another
 * machine, with no account and nothing to ask permission for.
 */

const FILE_VERSION = 1;

interface ResumeFile {
  format: "crivai-resume";
  version: number;
  exportedAt: string;
  resume: Resume;
}

export function buildExportFile(resume: Resume): ResumeFile {
  return {
    format: "crivai-resume",
    version: FILE_VERSION,
    exportedAt: new Date().toISOString(),
    resume,
  };
}

export function exportFileName(now = new Date()): string {
  const date = now.toISOString().slice(0, 10);
  return `crivai-curriculo-${date}.json`;
}

/** Triggers a download without a server: the file is built in the browser. */
export function downloadResume(resume: Resume): void {
  const blob = new Blob([JSON.stringify(buildExportFile(resume), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = exportFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Without this the blob stays in memory for the life of the page.
  URL.revokeObjectURL(url);
}

export type ImportResult =
  { status: "ok"; resume: Resume } | { status: "invalid" };

/**
 * Reads a previously exported file.
 *
 * Everything is validated before it reaches the store. This file has been on the
 * user's disk, possibly hand-edited, possibly from another version — treating it
 * as trusted input is how a corrupt file becomes a blank screen.
 */
export function parseImportedFile(contents: string): ImportResult {
  try {
    const parsed = JSON.parse(contents) as Partial<ResumeFile>;
    // Accepts any version whose payload still satisfies the current schema,
    // rather than refusing on a version number alone.
    const result = resumeSchema.safeParse(parsed.resume);
    if (!result.success) return { status: "invalid" };
    return { status: "ok", resume: result.data };
  } catch {
    return { status: "invalid" };
  }
}
