"use client";

import { useTranslation } from "@/components/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { RepeatableSection } from "@/components/ui/RepeatableSection";
import { Select } from "@/components/ui/Select";
import { TextArea } from "@/components/ui/TextArea";
import { ValidatedInput } from "./ValidatedInput";
import { emptyExperience } from "@/lib/resume/empty";
import { experienceSchema } from "@/lib/resume/schema";
import { useEntry, useListIds, useResumeStore } from "@/lib/resume/store";
import { entryError } from "@/lib/resume/validation";

export function ExperienceSection() {
  const { t } = useTranslation();
  const ids = useListIds("experiences");
  const addEntry = useResumeStore((state) => state.addEntry);
  const removeEntry = useResumeStore((state) => state.removeEntry);
  const moveEntry = useResumeStore((state) => state.moveEntry);

  return (
    <RepeatableSection
      items={ids}
      getKey={(id) => id}
      addLabel={t("section.experience.add")}
      emptyLabel={t("repeatable.empty")}
      onAdd={() => addEntry("experiences", emptyExperience())}
      onRemove={(index) => {
        const id = ids[index];
        if (id !== undefined) removeEntry("experiences", id);
      }}
      onMove={(from, to) => moveEntry("experiences", from, to)}
      renderItem={(id) => <ExperienceCard id={id} />}
    />
  );
}

function ExperienceCard({ id }: { id: string }) {
  const { t } = useTranslation();
  const entry = useEntry("experiences", id);
  const updateEntry = useResumeStore((state) => state.updateEntry);

  if (entry === undefined) return null;

  const update = (patch: Partial<typeof entry>) =>
    updateEntry("experiences", id, patch);

  const endErrorKey = entryError(experienceSchema, entry, "end");

  const setBullet = (index: number, text: string) => {
    const bullets = entry.bullets.map((bullet, i) =>
      i === index ? text : bullet,
    );
    update({ bullets });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <ValidatedInput
          label={t("form.experience.role")}
          value={entry.role}
          onValueChange={(role) => update({ role })}
        />
        <ValidatedInput
          label={t("form.experience.company")}
          value={entry.company}
          onValueChange={(company) => update({ company })}
        />
        <ValidatedInput
          label={t("form.experience.location")}
          value={entry.location}
          onValueChange={(location) => update({ location })}
          optional
        />
        <Select
          label={t("form.experience.workMode")}
          value={entry.workMode ?? ""}
          onChange={(event) =>
            update({
              workMode:
                event.target.value === ""
                  ? null
                  : (event.target.value as typeof entry.workMode),
            })
          }
          options={[
            { value: "onsite", label: t("form.experience.workMode.onsite") },
            { value: "hybrid", label: t("form.experience.workMode.hybrid") },
            { value: "remote", label: t("form.experience.workMode.remote") },
          ]}
          optional
        />
      </div>

      {/*
        Contractor and freelance work, recorded per entry (research § 7.5). Phase 6
        uses it to advise gathering scattered clients under one umbrella role, so
        an ATS does not read a dozen short engagements as job hopping.
      */}
      <Checkbox
        label={t("form.experience.selfEmployed")}
        checked={entry.isSelfEmployed}
        onChange={(event) => update({ isSelfEmployed: event.target.checked })}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <MonthYearPicker
          label={t("form.experience.start")}
          value={entry.start}
          onChange={(start) => update({ start })}
        />
        {/*
          Ticking "I work here now" hides the end date rather than disabling it.
          A disabled field still takes up space and still reads as something left
          unfilled.
        */}
        {!entry.isCurrent && (
          <MonthYearPicker
            label={t("form.experience.end")}
            value={entry.end}
            onChange={(end) => update({ end })}
            error={endErrorKey === undefined ? undefined : t(endErrorKey)}
          />
        )}
      </div>

      <Checkbox
        label={t("form.experience.isCurrent")}
        checked={entry.isCurrent}
        onChange={(event) => update({ isCurrent: event.target.checked })}
      />

      <div className="flex flex-col gap-3">
        <div>
          <p className="text-ink text-sm font-medium">
            {t("form.experience.bullets")}
          </p>
          <p className="text-subtle mt-1 text-sm">
            {t("form.experience.bulletsHint")}
          </p>
        </div>

        {entry.bullets.map((bullet, index) => (
          <div key={index} className="flex items-start gap-2">
            <TextArea
              label={`${t("form.experience.bullets")} ${index + 1}`}
              value={bullet}
              onChange={(event) => setBullet(index, event.target.value)}
              rows={2}
              className="flex-1"
            />
            {entry.bullets.length > 1 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() =>
                  update({
                    bullets: entry.bullets.filter((_, i) => i !== index),
                  })
                }
                aria-label={t("form.experience.removeBullet")}
              >
                <span aria-hidden="true">×</span>
              </Button>
            )}
          </div>
        ))}

        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => update({ bullets: [...entry.bullets, ""] })}
          >
            <span aria-hidden="true">+</span>
            {t("form.experience.addBullet")}
          </Button>
        </div>
      </div>
    </div>
  );
}
