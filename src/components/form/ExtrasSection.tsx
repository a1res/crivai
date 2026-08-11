"use client";

import { useTranslation } from "@/components/i18n/LocaleProvider";
import { RepeatableSection } from "@/components/ui/RepeatableSection";
import { TextArea } from "@/components/ui/TextArea";
import { ValidatedInput } from "./ValidatedInput";
import {
  emptyCertification,
  emptyProject,
  emptyVolunteering,
} from "@/lib/resume/empty";
import { certificationSchema, projectSchema } from "@/lib/resume/schema";
import { useEntry, useListIds, useResumeStore } from "@/lib/resume/store";

/**
 * Projects, certifications and volunteering.
 *
 * Grouped into one section rather than three, to keep the side navigation at
 * eight entries instead of eleven. All three are optional for most people and
 * carry the most weight early in a career (research §§ 5–7), where projects and
 * volunteering stand in for a work history that does not exist yet.
 */
export function ExtrasSection() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-8">
      <ExtrasGroup title={t("extras.projects")}>
        <ProjectsList />
      </ExtrasGroup>
      <ExtrasGroup title={t("extras.certifications")}>
        <CertificationsList />
      </ExtrasGroup>
      <ExtrasGroup title={t("extras.volunteering")}>
        <VolunteeringList />
      </ExtrasGroup>
    </div>
  );
}

function ExtrasGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-ink text-base font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function ProjectsList() {
  const { t } = useTranslation();
  const ids = useListIds("projects");
  const addEntry = useResumeStore((state) => state.addEntry);
  const removeEntry = useResumeStore((state) => state.removeEntry);
  const moveEntry = useResumeStore((state) => state.moveEntry);

  return (
    <RepeatableSection
      items={ids}
      getKey={(id) => id}
      addLabel={t("section.extras.add")}
      emptyLabel={t("repeatable.empty")}
      onAdd={() => addEntry("projects", emptyProject())}
      onRemove={(index) => {
        const id = ids[index];
        if (id !== undefined) removeEntry("projects", id);
      }}
      onMove={(from, to) => moveEntry("projects", from, to)}
      renderItem={(id) => <ProjectCard id={id} />}
    />
  );
}

function ProjectCard({ id }: { id: string }) {
  const { t } = useTranslation();
  const entry = useEntry("projects", id);
  const updateEntry = useResumeStore((state) => state.updateEntry);

  if (entry === undefined) return null;

  return (
    <div className="flex flex-col gap-5">
      <ValidatedInput
        label={t("form.project.name")}
        value={entry.name}
        onValueChange={(name) => updateEntry("projects", id, { name })}
      />
      <TextArea
        label={t("form.project.description")}
        value={entry.description}
        onChange={(event) =>
          updateEntry("projects", id, { description: event.target.value })
        }
        rows={2}
        optional
      />
      <ValidatedInput
        label={t("form.project.url")}
        hint={t("form.identification.linkHint")}
        value={entry.url}
        onValueChange={(url) => updateEntry("projects", id, { url })}
        schema={projectSchema.shape.url}
        inputMode="url"
        optional
      />
    </div>
  );
}

function CertificationsList() {
  const { t } = useTranslation();
  const ids = useListIds("certifications");
  const addEntry = useResumeStore((state) => state.addEntry);
  const removeEntry = useResumeStore((state) => state.removeEntry);
  const moveEntry = useResumeStore((state) => state.moveEntry);

  return (
    <RepeatableSection
      items={ids}
      getKey={(id) => id}
      addLabel={t("section.extras.add")}
      emptyLabel={t("repeatable.empty")}
      onAdd={() => addEntry("certifications", emptyCertification())}
      onRemove={(index) => {
        const id = ids[index];
        if (id !== undefined) removeEntry("certifications", id);
      }}
      onMove={(from, to) => moveEntry("certifications", from, to)}
      renderItem={(id) => <CertificationCard id={id} />}
    />
  );
}

function CertificationCard({ id }: { id: string }) {
  const { t } = useTranslation();
  const entry = useEntry("certifications", id);
  const updateEntry = useResumeStore((state) => state.updateEntry);

  if (entry === undefined) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <ValidatedInput
          label={t("form.certification.name")}
          value={entry.name}
          onValueChange={(name) => updateEntry("certifications", id, { name })}
        />
        <ValidatedInput
          label={t("form.certification.issuer")}
          value={entry.issuer}
          onValueChange={(issuer) =>
            updateEntry("certifications", id, { issuer })
          }
        />
        <ValidatedInput
          label={t("form.certification.year")}
          value={entry.year}
          onValueChange={(year) => updateEntry("certifications", id, { year })}
          optional
        />
        <ValidatedInput
          label={t("form.certification.url")}
          value={entry.url}
          onValueChange={(url) => updateEntry("certifications", id, { url })}
          schema={certificationSchema.shape.url}
          inputMode="url"
          optional
        />
      </div>
    </div>
  );
}

function VolunteeringList() {
  const { t } = useTranslation();
  const ids = useListIds("volunteering");
  const addEntry = useResumeStore((state) => state.addEntry);
  const removeEntry = useResumeStore((state) => state.removeEntry);
  const moveEntry = useResumeStore((state) => state.moveEntry);

  return (
    <RepeatableSection
      items={ids}
      getKey={(id) => id}
      addLabel={t("section.extras.add")}
      emptyLabel={t("repeatable.empty")}
      onAdd={() => addEntry("volunteering", emptyVolunteering())}
      onRemove={(index) => {
        const id = ids[index];
        if (id !== undefined) removeEntry("volunteering", id);
      }}
      onMove={(from, to) => moveEntry("volunteering", from, to)}
      renderItem={(id) => <VolunteeringCard id={id} />}
    />
  );
}

function VolunteeringCard({ id }: { id: string }) {
  const { t } = useTranslation();
  const entry = useEntry("volunteering", id);
  const updateEntry = useResumeStore((state) => state.updateEntry);

  if (entry === undefined) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <ValidatedInput
          label={t("form.volunteering.organization")}
          value={entry.organization}
          onValueChange={(organization) =>
            updateEntry("volunteering", id, { organization })
          }
        />
        <ValidatedInput
          label={t("form.volunteering.role")}
          value={entry.role}
          onValueChange={(role) => updateEntry("volunteering", id, { role })}
        />
      </div>
      <TextArea
        label={t("form.volunteering.description")}
        value={entry.description}
        onChange={(event) =>
          updateEntry("volunteering", id, { description: event.target.value })
        }
        rows={2}
        optional
      />
    </div>
  );
}
