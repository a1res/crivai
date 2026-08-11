"use client";

import { useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import { Field, controlClassName, describedBy } from "./Field";

export interface TextAreaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id"
> {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
}

export function TextArea({
  label,
  hint,
  error,
  optional,
  className,
  rows = 4,
  ...rest
}: TextAreaProps) {
  const id = useId();

  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        id={id}
        rows={rows}
        aria-describedby={describedBy(id, hint, error)}
        aria-invalid={error !== undefined || undefined}
        className={controlClassName(error !== undefined, className)}
        {...rest}
      />
    </Field>
  );
}
