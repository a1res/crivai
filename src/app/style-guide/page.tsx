"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/components/i18n/LocaleProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import type { MonthYear } from "@/components/ui/MonthYearPicker";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { RepeatableSection } from "@/components/ui/RepeatableSection";
import { Select } from "@/components/ui/Select";
import { TextArea } from "@/components/ui/TextArea";
import { Tooltip } from "@/components/ui/Tooltip";

/*
 * Internal page for reviewing the design system: every component, in each of its
 * states, on one screen.
 *
 * It is a route rather than Storybook so it can simply be opened on a phone at
 * the deployed URL — the reviewer needs no toolchain. Deleted before launch
 * (Phase 10).
 */

const SWATCHES = [
  { token: "bg-primary", label: "primary" },
  { token: "bg-primary-soft", label: "primary-soft" },
  { token: "bg-ink", label: "ink" },
  { token: "bg-muted", label: "muted" },
  { token: "bg-subtle", label: "subtle" },
  { token: "bg-border", label: "border" },
  { token: "bg-surface", label: "surface" },
  { token: "bg-success", label: "success" },
  { token: "bg-warning", label: "warning" },
  { token: "bg-danger", label: "danger" },
] as const;

interface DemoItem {
  id: string;
  label: string;
}

let nextId = 0;

export default function StyleGuide() {
  const { t } = useTranslation();
  const [date, setDate] = useState<MonthYear | null>(null);
  const [items, setItems] = useState<DemoItem[]>([
    { id: "demo-a", label: "A" },
    { id: "demo-b", label: "B" },
  ]);

  const move = (from: number, to: number) => {
    setItems((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      if (moved !== undefined) next.splice(to, 0, moved);
      return next;
    });
  };

  return (
    <main id="conteudo" className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-ink text-3xl font-semibold tracking-tight">
        {t("styleGuide.title")}
      </h1>
      <p className="text-muted mt-2">{t("styleGuide.description")}</p>
      <Link
        href="/"
        className="text-primary mt-2 inline-block text-sm underline"
      >
        {t("styleGuide.back")}
      </Link>

      <Section title={t("styleGuide.colors")}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {SWATCHES.map((swatch) => (
            <li key={swatch.label} className="flex flex-col gap-1">
              <span
                className={`${swatch.token} border-border h-12 w-full rounded-md border`}
              />
              <span className="text-subtle text-xs">{swatch.label}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t("styleGuide.typography")}>
        <div className="flex flex-col gap-2">
          <p className="text-ink text-3xl font-semibold tracking-tight">
            {t("app.name")}
          </p>
          <p className="text-ink text-xl font-semibold">
            {t("section.experience.title")}
          </p>
          <p className="text-muted text-base">{t("app.tagline")}</p>
          <p className="text-subtle text-sm">{t("app.status")}</p>
        </div>
      </Section>

      <Section title={t("styleGuide.buttons")}>
        <div className="flex flex-wrap items-center gap-3">
          <Button>{t("styleGuide.variant.primary")}</Button>
          <Button variant="secondary">
            {t("styleGuide.variant.secondary")}
          </Button>
          <Button variant="ghost">{t("styleGuide.variant.ghost")}</Button>
          <Button variant="danger">{t("styleGuide.variant.danger")}</Button>
          <Button disabled>{t("styleGuide.state.disabled")}</Button>
          <Button size="sm" variant="secondary">
            sm
          </Button>
        </div>
      </Section>

      <Section title={t("styleGuide.fields")}>
        <div className="flex flex-col gap-5">
          <Input label={t("demo.fullName")} hint={t("demo.fullNameHint")} />
          <Input
            label={t("demo.email")}
            type="email"
            defaultValue="nao-e-um-email"
            error={t("demo.emailError")}
          />
          <Input label={t("demo.fullName")} disabled />
          <TextArea label={t("demo.summary")} hint={t("demo.summaryHint")} />
          <Select
            label={t("demo.level")}
            options={[
              { value: "basic", label: t("demo.levelBasic") },
              { value: "intermediate", label: t("demo.levelIntermediate") },
              { value: "advanced", label: t("demo.levelAdvanced") },
            ]}
          />
          <MonthYearPicker
            label={t("demo.startDate")}
            value={date}
            onChange={setDate}
            optional
          />
          <div className="flex items-center gap-2">
            <span className="text-ink text-sm font-medium">
              {t("demo.experience")}
            </span>
            <Tooltip content={t("demo.tooltip")} />
          </div>
        </div>
      </Section>

      <Section title={t("styleGuide.feedback")}>
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">{t("demo.badgeGood")}</Badge>
          <Badge tone="warning">{t("demo.badgeWarning")}</Badge>
          <Badge tone="danger">{t("demo.badgeCritical")}</Badge>
          <Badge>{t("styleGuide.state.default")}</Badge>
        </div>
      </Section>

      <Section title={t("styleGuide.progress")}>
        <ProgressIndicator done={3} total={8} />
      </Section>

      <Section title={t("styleGuide.repeatable")}>
        <RepeatableSection
          items={items}
          getKey={(item) => item.id}
          addLabel={t("section.experience.add")}
          emptyLabel={t("repeatable.empty")}
          onAdd={() =>
            setItems((current) => [
              ...current,
              { id: `demo-${(nextId += 1)}`, label: "?" },
            ])
          }
          onRemove={(index) =>
            setItems((current) => current.filter((_, i) => i !== index))
          }
          onMove={move}
          renderItem={(item) => (
            <Input label={t("demo.experience")} defaultValue={item.label} />
          )}
        />
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-ink mb-3 text-lg font-semibold">{title}</h2>
      <Card>{children}</Card>
    </section>
  );
}
