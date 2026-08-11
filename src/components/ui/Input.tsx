"use client";

import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import { Field, controlClassName, describedBy } from "./Field";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id"
> {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
}

export function Input({
  label,
  hint,
  error,
  optional,
  className,
  ...rest
}: InputProps) {
  const id = useId();

  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      <input
        id={id}
        aria-describedby={describedBy(id, hint, error)}
        aria-invalid={error !== undefined || undefined}
        className={controlClassName(error !== undefined, className)}
        {...rest}
      />
    </Field>
  );
}
