"use client";

import { useId } from "react";
import { useTranslation } from "@/components/i18n/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n/types";
import { controlClassName, describedBy } from "./Field";

export interface MonthYear {
  /** 1–12. */
  month: number;
  year: number;
}

export interface MonthYearPickerProps {
  label: string;
  value: MonthYear | null;
  onChange: (value: MonthYear | null) => void;
  hint?: string;
  error?: string;
  optional?: boolean;
  disabled?: boolean;
}

const MONTH_KEYS = [
  "month.1",
  "month.2",
  "month.3",
  "month.4",
  "month.5",
  "month.6",
  "month.7",
  "month.8",
  "month.9",
  "month.10",
  "month.11",
  "month.12",
] as const satisfies readonly TranslationKey[];

/** How far back the year list goes. Long enough for a full career. */
const YEARS_BACK = 60;

/**
 * Month and year only — never a day.
 *
 * Resumes are written and read at month granularity, and asking for a day
 * invents a precision the user does not have for a job they left in 2014.
 *
 * Two native selects rather than a calendar widget: they work on every phone,
 * with a keyboard, and with a screen reader, at no cost.
 *
 * Knows nothing about "current job" — that toggle belongs to the form in Phase 2,
 * which simply stops rendering the end date.
 */
export function MonthYearPicker({
  label,
  value,
  onChange,
  hint,
  error,
  optional = false,
  disabled = false,
}: MonthYearPickerProps) {
  const groupId = useId();
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: YEARS_BACK }, (_, i) => currentYear - i);

  const update = (next: Partial<MonthYear>) => {
    const month = next.month ?? value?.month;
    const year = next.year ?? value?.year;
    // Half a date is not a date. The value stays null until both parts exist,
    // so downstream code never has to guess a missing half.
    if (month === undefined || year === undefined) {
      onChange(null);
      return;
    }
    onChange({ month, year });
  };

  return (
    <fieldset
      className="flex flex-col gap-1.5"
      aria-describedby={describedBy(groupId, hint, error)}
      disabled={disabled}
    >
      <legend className="text-ink text-sm font-medium">
        {label}
        {optional && (
          <span className="text-subtle font-normal">
            {" "}
            ({t("field.optional")})
          </span>
        )}
      </legend>

      <div className="flex gap-2">
        <select
          aria-label={t("monthYear.month")}
          value={value?.month ?? ""}
          onChange={(event) =>
            update({
              month:
                event.target.value === ""
                  ? undefined
                  : Number(event.target.value),
            })
          }
          aria-invalid={error !== undefined || undefined}
          className={controlClassName(error !== undefined)}
        >
          <option value="">{t("monthYear.month")}</option>
          {MONTH_KEYS.map((key, index) => (
            <option key={key} value={index + 1}>
              {t(key)}
            </option>
          ))}
        </select>

        <select
          aria-label={t("monthYear.year")}
          value={value?.year ?? ""}
          onChange={(event) =>
            update({
              year:
                event.target.value === ""
                  ? undefined
                  : Number(event.target.value),
            })
          }
          aria-invalid={error !== undefined || undefined}
          className={controlClassName(error !== undefined)}
        >
          <option value="">{t("monthYear.year")}</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {error !== undefined ? (
        <p id={`${groupId}-error`} className="text-danger text-sm">
          {error}
        </p>
      ) : (
        hint !== undefined && (
          <p id={`${groupId}-hint`} className="text-subtle text-sm">
            {hint}
          </p>
        )
      )}
    </fieldset>
  );
}
