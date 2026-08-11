"use client";

import { useState } from "react";
import type { ZodType } from "zod";
import { useTranslation } from "@/components/i18n/LocaleProvider";
import { Input } from "@/components/ui/Input";
import { fieldError } from "@/lib/resume/validation";

export interface ValidatedInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  /** The matching piece of the resume schema, e.g. identificationSchema.shape.email. */
  schema?: ZodType;
  hint?: string;
  type?: string;
  placeholder?: string;
  optional?: boolean;
  inputMode?: "text" | "email" | "tel" | "url";
}

/**
 * A text field that only complains once you have left it.
 *
 * Validating while someone types means telling them their email is wrong before
 * they have finished writing it, which is both useless and discouraging. The
 * error appears on blur and clears as soon as the value is valid again.
 */
export function ValidatedInput({
  label,
  value,
  onValueChange,
  schema,
  hint,
  type = "text",
  placeholder,
  optional,
  inputMode,
}: ValidatedInputProps) {
  const { t } = useTranslation();
  const [blurred, setBlurred] = useState(false);

  const errorKey =
    blurred && schema !== undefined ? fieldError(schema, value) : undefined;

  return (
    <Input
      label={label}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      onBlur={() => setBlurred(true)}
      hint={hint}
      error={errorKey === undefined ? undefined : t(errorKey)}
      type={type}
      placeholder={placeholder}
      optional={optional}
      inputMode={inputMode}
    />
  );
}
