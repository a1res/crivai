"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "@/components/i18n/LocaleProvider";

export interface TooltipProps {
  /** Explanation text, already translated. */
  content: string;
}

/**
 * A disclosure, not a hover tooltip.
 *
 * Hover-only tooltips are unreachable on touch, which is how a large share of
 * this audience will use the site, and awkward by keyboard. This opens on click
 * or Enter, closes on Escape or an outside click, and reports its state through
 * aria-expanded.
 */
export function Tooltip({ content }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const containerRef = useRef<HTMLSpanElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        containerRef.current !== null &&
        !containerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  return (
    <span ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={id}
        aria-label={t("field.moreInfo")}
        className="border-border-strong text-muted hover:border-primary hover:text-primary inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border text-xs font-semibold transition-colors"
      >
        ?
      </button>

      {open && (
        <span
          id={id}
          role="note"
          className="border-border bg-canvas text-ink shadow-raised rounded-card absolute top-7 left-0 z-10 w-64 border p-3 text-sm"
        >
          {content}
        </span>
      )}
    </span>
  );
}
