"use client";

import { useTranslation } from "@/components/i18n/LocaleProvider";
import { Checkbox } from "@/components/ui/Checkbox";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { RepeatableSection } from "@/components/ui/RepeatableSection";
import { Select } from "@/components/ui/Select";
import { ValidatedInput } from "./ValidatedInput";
import { emptyEducation } from "@/lib/resume/empty";
import { educationSchema } from "@/lib/resume/schema";
import { useEntry, useListIds, useResumeStore } from "@/lib/resume/store";
import { entryError } from "@/lib/resume/validation";

export function EducationSection() {
  const { t } = useTranslation();
  const ids = useListIds("education");
  const addEntry = useResumeStore((state) => state.addEntry);
  const removeEntry = useResumeStore((state) => state.removeEntry);
  const moveEntry = useResumeStore((state) => state.moveEntry);

  return (
    <RepeatableSection
      items={ids}
      getKey={(id) => id}
      addLabel={t("section.education.add")}
      emptyLabel={t("repeatable.empty")}
      onAdd={() => addEntry("education", emptyEducation())}
      onRemove={(index) => {
        const id = ids[index];
        if (id !== undefined) removeEntry("education", id);
      }}
      onMove={(from, to) => moveEntry("education", from, to)}
      renderItem={(id) => <EducationCard id={id} />}
    />
  );
}

function EducationCard({ id }: { id: string }) {
  const { t } = useTranslation();
  const entry = useEntry("education", id);
  const updateEntry = useResumeStore((state) => state.updateEntry);

  if (entry === undefined) return null;

  const update = (patch: Partial<typeof entry>) =>
    updateEntry("education", id, patch);

  const endErrorKey = entryError(educationSchema, entry, "end");

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <ValidatedInput
          label={t("form.education.institution")}
          value={entry.institution}
          onValueChange={(institution) => update({ institution })}
        />
        <ValidatedInput
          label={t("form.education.course")}
          value={entry.course}
          onValueChange={(course) => update({ course })}
        />
        <ValidatedInput
          label={t("form.education.degree")}
          hint={t("form.education.degreeHint")}
          value={entry.degree}
          onValueChange={(degree) => update({ degree })}
          optional
        />
        <Select
          label={t("form.education.status")}
          value={entry.status ?? ""}
          onChange={(event) =>
            update({
              status:
                event.target.value === ""
                  ? null
                  : (event.target.value as typeof entry.status),
            })
          }
          options={[
            {
              value: "completed",
              label: t("form.education.status.completed"),
            },
            {
              value: "inProgress",
              label: t("form.education.status.inProgress"),
            },
            {
              value: "interrupted",
              label: t("form.education.status.interrupted"),
            },
          ]}
          optional
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <MonthYearPicker
          label={t("form.experience.start")}
          value={entry.start}
          onChange={(start) => update({ start })}
          optional
        />
        {!entry.isCurrent && (
          <MonthYearPicker
            label={t("form.experience.end")}
            value={entry.end}
            onChange={(end) => update({ end })}
            error={endErrorKey === undefined ? undefined : t(endErrorKey)}
            optional
          />
        )}
      </div>

      <Checkbox
        label={t("form.education.isCurrent")}
        checked={entry.isCurrent}
        onChange={(event) => update({ isCurrent: event.target.checked })}
      />
    </div>
  );
}
