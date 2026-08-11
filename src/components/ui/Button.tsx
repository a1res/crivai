"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary:
    "bg-canvas text-ink border border-border-strong hover:border-primary hover:text-primary",
  ghost: "bg-transparent text-muted hover:bg-primary-soft hover:text-primary",
  danger: "bg-transparent text-danger hover:bg-danger-soft",
};

const SIZES: Record<ButtonSize, string> = {
  // 44px tall, the minimum comfortable touch target.
  md: "min-h-11 px-4 text-base",
  sm: "min-h-9 px-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      // Defaults to "button" on purpose. An unspecified type inside a form is
      // "submit", which is how a stray click wipes out a half-filled resume.
      type={type}
      className={cn(
        "rounded-control inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
