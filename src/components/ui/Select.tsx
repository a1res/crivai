"use client";

import { useId } from "react";
import type { SelectHTMLAttributes } from "react";
import { useTranslation } from "@/components/i18n/LocaleProvider";
import { Field, controlClassName, describedBy } from "./Field";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "id" | "children"
> {
  label: string;
  options: readonly SelectOption[];
  hint?: string;
  error?: string;
  optional?: boolean;
  /** Shows an empty leading option. Omit when a value is always present. */
  placeholder?: boolean;
}

export function Select({
  label,
  options,
  hint,
  error,
  optional,
  placeholder = true,
  className,
  ...rest
}: SelectProps) {
  const id = useId();
  const { t } = useTranslation();

  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      <select
        id={id}
        aria-describedby={describedBy(id, hint, error)}
        aria-invalid={error !== undefined || undefined}
        className={controlClassName(error !== undefined, className)}
        {...rest}
      >
        {placeholder && <option value="">{t("field.select")}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
