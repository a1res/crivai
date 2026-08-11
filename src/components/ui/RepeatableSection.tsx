"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "@/components/i18n/LocaleProvider";
import { Button } from "./Button";
import { Card } from "./Card";

export interface RepeatableSectionProps<T> {
  items: readonly T[];
  /** Stable key for an item. Must not be the array index — items get reordered. */
  getKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  /**
   * Fully translated label, e.g. "Adicionar outra experiência".
   *
   * Passed in whole rather than built from a noun: in Portuguese the article
   * agrees with the noun's gender ("outra experiência" but "outro projeto"), so
   * a template with a slot produces wrong sentences.
   */
  addLabel: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  /** Shown in place of the list while it is empty. */
  emptyLabel?: string;
}

/**
 * The repeating block that carries the whole form: one card per entry, with
 * "add another" underneath.
 *
 * Reordering is up/down buttons rather than drag and drop. Dragging fights page
 * scrolling on touch, where much of this audience will be, and needs a library
 * plus separate keyboard support to be usable at all. Buttons are reachable by
 * touch, keyboard and screen reader with none of that.
 */
export function RepeatableSection<T>({
  items,
  getKey,
  renderItem,
  addLabel,
  onAdd,
  onRemove,
  onMove,
  emptyLabel,
}: RepeatableSectionProps<T>) {
  const { t } = useTranslation();
  // Order and removal are visual events. Without an announcement, someone using
  // a screen reader presses "move up" and hears nothing at all.
  const [announcement, setAnnouncement] = useState("");

  const move = (from: number, to: number) => {
    onMove(from, to);
    setAnnouncement(
      t("repeatable.moved", { position: to + 1, total: items.length }),
    );
  };

  const remove = (index: number) => {
    onRemove(index);
    setAnnouncement(t("repeatable.removed"));
  };

  const add = () => {
    onAdd();
    setAnnouncement(t("repeatable.added"));
  };

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && emptyLabel !== undefined ? (
        <p className="text-subtle text-sm">{emptyLabel}</p>
      ) : (
        <ul className="flex list-none flex-col gap-3 p-0">
          {items.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === items.length - 1;

            return (
              <Card as="li" key={getKey(item, index)}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-subtle text-sm">
                    {t("repeatable.position", {
                      position: index + 1,
                      total: items.length,
                    })}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => move(index, index - 1)}
                      disabled={isFirst}
                      aria-label={t("action.moveUp")}
                    >
                      <span aria-hidden="true">↑</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => move(index, index + 1)}
                      disabled={isLast}
                      aria-label={t("action.moveDown")}
                    >
                      <span aria-hidden="true">↓</span>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      {t("action.remove")}
                    </Button>
                  </div>
                </div>

                {renderItem(item, index)}
              </Card>
            );
          })}
        </ul>
      )}

      <div>
        <Button variant="secondary" onClick={add}>
          <span aria-hidden="true">+</span>
          {addLabel}
        </Button>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
