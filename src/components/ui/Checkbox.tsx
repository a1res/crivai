"use client";

import { useId } from "react";
import type { InputHTMLAttributes } from "react";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "type"
> {
  label: string;
  hint?: string;
}

/**
 * A native checkbox with a proper label.
 *
 * Not part of the Phase 1 set — the "current job" toggle in Phase 2 needed it.
 * Left native rather than restyled into a switch: the browser already gives it
 * keyboard support, screen reader semantics and the platform's own focus
 * behaviour, and a custom control would have to re-earn all three.
 */
export function Checkbox({ label, hint, ...rest }: CheckboxProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="checkbox"
          className="accent-primary size-4 cursor-pointer"
          aria-describedby={hint === undefined ? undefined : `${id}-hint`}
          {...rest}
        />
        <label htmlFor={id} className="text-ink cursor-pointer text-sm">
          {label}
        </label>
      </div>
      {hint !== undefined && (
        <p id={`${id}-hint`} className="text-subtle pl-6 text-sm">
          {hint}
        </p>
      )}
    </div>
  );
}
