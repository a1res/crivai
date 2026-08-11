"use client";

import type { ReactNode } from "react";
import { useTranslation } from "@/components/i18n/LocaleProvider";
import { cn } from "@/lib/cn";

export interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}

/**
 * Label, hint and error scaffolding shared by every form control.
 *
 * The hint and the error use the same slot: once something is wrong, the error
 * is the only thing that matters there, and stacking both pushes the field the
 * user is working on further up the screen.
 */
export function Field({
  id,
  label,
  hint,
  error,
  optional = false,
  children,
}: FieldProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-ink text-sm font-medium">
        {label}
        {optional && (
          <span className="text-subtle font-normal">
            {" "}
            ({t("field.optional")})
          </span>
        )}
      </label>

      {children}

      {error !== undefined ? (
        <p id={`${id}-error`} className="text-danger text-sm">
          {error}
        </p>
      ) : (
        hint !== undefined && (
          <p id={`${id}-hint`} className="text-subtle text-sm">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Ties a control to whichever of its hint or error is currently rendered. */
export function describedBy(
  id: string,
  hint: string | undefined,
  error: string | undefined,
): string | undefined {
  if (error !== undefined) return `${id}-error`;
  if (hint !== undefined) return `${id}-hint`;
  return undefined;
}

/**
 * Shared control surface.
 *
 * The 16px base font size is load-bearing rather than aesthetic: iOS Safari
 * zooms the page when a focused input is smaller than that, and much of this
 * audience fills the form on a phone.
 */
export function controlClassName(hasError: boolean, extra?: string): string {
  return cn(
    "w-full rounded-control border bg-canvas px-3 py-2 text-base text-ink",
    "placeholder:text-subtle transition-colors",
    hasError
      ? "border-danger"
      : "border-border-strong hover:border-primary focus:border-primary",
    "disabled:cursor-not-allowed disabled:bg-surface disabled:text-subtle",
    extra,
  );
}
