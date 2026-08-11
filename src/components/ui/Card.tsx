"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CardProps {
  children: ReactNode;
  className?: string;
  /** Renders as <li>, for cards inside a list of repeatable items. */
  as?: "div" | "li";
}

export function Card({ children, className, as = "div" }: CardProps) {
  const Element = as;
  return (
    <Element
      className={cn(
        "border-border bg-canvas rounded-card shadow-card border p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </Element>
  );
}
