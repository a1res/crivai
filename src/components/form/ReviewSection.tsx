"use client";

import { useRef, useState } from "react";
import { useTranslation } from "@/components/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { downloadResume, parseImportedFile } from "@/lib/resume/json";
import { clearStoredResume } from "@/lib/resume/persistence";
import { useResumeStore } from "@/lib/resume/store";

type Feedback = "imported" | "import-failed" | "cleared" | null;

/**
 * Where the user takes their data out, brings it back, or destroys it.
 *
 * These three are the local-first promise made operable. A privacy claim nobody
 * can act on is just a sentence on a page.
 */
export function ReviewSection() {
  const { t } = useTranslation();
  const resume = useResumeStore((state) => state.resume);
  const replaceResume = useResumeStore((state) => state.replaceResume);
  const clearAll = useResumeStore((state) => state.clearAll);
  const setRestoredAt = useResumeStore((state) => state.setRestoredAt);

  const [confirmingClear, setConfirmingClear] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleImport = async (file: File) => {
    const result = parseImportedFile(await file.text());
    if (result.status === "ok") {
      replaceResume(result.resume);
      setFeedback("imported");
    } else {
      setFeedback("import-failed");
    }
  };

  const handleClear = () => {
    clearAll();
    clearStoredResume();
    setRestoredAt(null);
    setConfirmingClear(false);
    setFeedback("cleared");
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted text-sm">{t("review.privacy")}</p>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => downloadResume(resume)}>
            {t("review.export")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileInput.current?.click()}
          >
            {t("review.import")}
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file !== undefined) void handleImport(file);
              // Reset, so choosing the same file twice fires onChange again.
              event.target.value = "";
            }}
          />
        </div>
        <p className="text-subtle text-sm">{t("review.exportHint")}</p>
      </div>

      <div className="border-border flex flex-col gap-2 border-t pt-6">
        {confirmingClear ? (
          <div className="border-danger/30 bg-danger-soft rounded-card flex flex-col gap-3 border p-4">
            <p className="text-danger text-sm font-medium">
              {t("review.clearConfirm")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="danger" size="sm" onClick={handleClear}>
                {t("review.clearConfirmYes")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingClear(false)}
              >
                {t("review.clearCancel")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/*
              Two steps rather than a native confirm(): the dialog can be
              translated, styled and read by a screen reader as part of the page,
              and browsers increasingly suppress confirm() anyway.
            */}
            <div>
              <Button variant="danger" onClick={() => setConfirmingClear(true)}>
                {t("review.clear")}
              </Button>
            </div>
            <p className="text-subtle text-sm">{t("review.clearHint")}</p>
          </>
        )}
      </div>

      <p role="status" aria-live="polite" className="text-sm">
        {feedback === "imported" && (
          <span className="text-success">{t("review.importSuccess")}</span>
        )}
        {feedback === "import-failed" && (
          <span className="text-danger">{t("review.importError")}</span>
        )}
        {feedback === "cleared" && (
          <span className="text-muted">{t("review.cleared")}</span>
        )}
      </p>
    </div>
  );
}
