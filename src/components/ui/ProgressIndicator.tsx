"use client";

import { useTranslation } from "@/components/i18n/LocaleProvider";

export interface ProgressIndicatorProps {
  done: number;
  total: number;
}

/**
 * How much of the resume is filled in.
 *
 * Purely presentational: what counts as a completed section is the form's
 * business, decided in Phase 2.
 */
export function ProgressIndicator({ done, total }: ProgressIndicatorProps) {
  const { t } = useTranslation();
  const safeTotal = Math.max(total, 1);
  const percent = Math.round((Math.min(done, safeTotal) / safeTotal) * 100);
  const caption = t("progress.count", { done, total });

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-ink text-sm font-medium">
          {t("progress.label")}
        </span>
        <span className="text-subtle text-sm">{caption}</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        // Screen readers would otherwise announce a bare percentage, which says
        // nothing about what is actually left to do.
        aria-valuetext={caption}
        className="bg-border h-1.5 w-full overflow-hidden rounded-full"
      >
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
