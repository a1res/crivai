"use client";

import { useTranslation } from "@/components/i18n/LocaleProvider";
import { TextArea } from "@/components/ui/TextArea";
import { useResumeStore } from "@/lib/resume/store";

export function SummarySection() {
  const { t } = useTranslation();
  const summary = useResumeStore((state) => state.resume.summary);
  const setSummary = useResumeStore((state) => state.setSummary);

  return (
    <TextArea
      label={t("form.summary.label")}
      hint={t("form.summary.hint")}
      value={summary}
      onChange={(event) => setSummary(event.target.value)}
      rows={5}
      optional
    />
  );
}
