"use client";

import { useTranslation } from "@/components/i18n/LocaleProvider";
import { RepeatableSection } from "@/components/ui/RepeatableSection";
import { ValidatedInput } from "./ValidatedInput";
import { emptyLanguage, emptySkill } from "@/lib/resume/empty";
import { useEntry, useListIds, useResumeStore } from "@/lib/resume/store";

export function SkillsSection() {
  const { t } = useTranslation();
  const ids = useListIds("skills");
  const addEntry = useResumeStore((state) => state.addEntry);
  const removeEntry = useResumeStore((state) => state.removeEntry);
  const moveEntry = useResumeStore((state) => state.moveEntry);

  return (
    <RepeatableSection
      items={ids}
      getKey={(id) => id}
      addLabel={t("section.skills.add")}
      emptyLabel={t("repeatable.empty")}
      onAdd={() => addEntry("skills", emptySkill())}
      onRemove={(index) => {
        const id = ids[index];
        if (id !== undefined) removeEntry("skills", id);
      }}
      onMove={(from, to) => moveEntry("skills", from, to)}
      renderItem={(id) => <SkillCard id={id} />}
    />
  );
}

function SkillCard({ id }: { id: string }) {
  const { t } = useTranslation();
  const entry = useEntry("skills", id);
  const updateEntry = useResumeStore((state) => state.updateEntry);

  if (entry === undefined) return null;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <ValidatedInput
        label={t("form.skill.name")}
        value={entry.name}
        onValueChange={(name) => updateEntry("skills", id, { name })}
      />
      <ValidatedInput
        label={t("form.skill.category")}
        hint={t("form.skill.categoryHint")}
        value={entry.category}
        onValueChange={(category) => updateEntry("skills", id, { category })}
        optional
      />
    </div>
  );
}

export function LanguagesSection() {
  const { t } = useTranslation();
  const ids = useListIds("languages");
  const addEntry = useResumeStore((state) => state.addEntry);
  const removeEntry = useResumeStore((state) => state.removeEntry);
  const moveEntry = useResumeStore((state) => state.moveEntry);

  return (
    <RepeatableSection
      items={ids}
      getKey={(id) => id}
      addLabel={t("section.languages.add")}
      emptyLabel={t("repeatable.empty")}
      onAdd={() => addEntry("languages", emptyLanguage())}
      onRemove={(index) => {
        const id = ids[index];
        if (id !== undefined) removeEntry("languages", id);
      }}
      onMove={(from, to) => moveEntry("languages", from, to)}
      renderItem={(id) => <LanguageCard id={id} />}
    />
  );
}

function LanguageCard({ id }: { id: string }) {
  const { t } = useTranslation();
  const entry = useEntry("languages", id);
  const updateEntry = useResumeStore((state) => state.updateEntry);

  if (entry === undefined) return null;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <ValidatedInput
        label={t("form.language.name")}
        value={entry.name}
        onValueChange={(name) => updateEntry("languages", id, { name })}
      />
      {/*
        Level is written, not scored. Filled dots and progress bars come out of a
        PDF parser as Unicode garbage or vanish entirely (CLAUDE.md § 4,
        restriction 2), taking the information with them.
      */}
      <ValidatedInput
        label={t("form.language.level")}
        hint={t("form.language.levelHint")}
        value={entry.level}
        onValueChange={(level) => updateEntry("languages", id, { level })}
      />
    </div>
  );
}
