"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "success" | "warning" | "danger";

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface text-muted border-border",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  danger: "bg-danger-soft text-danger border-danger/20",
};

/**
 * Always carries its own words.
 *
 * The resume health checklist in Phase 4 marks findings as fine, improvable or
 * critical, and colour alone cannot say which: roughly one in twelve men has
 * some colour vision deficiency, and red/green is the common pair. The tone
 * reinforces the label, never replaces it.
 */
export function Badge({ tone = "neutral", children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}
