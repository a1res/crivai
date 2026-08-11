"use client";

import { useTranslation } from "@/components/i18n/LocaleProvider";
import { ValidatedInput } from "./ValidatedInput";
import { identificationSchema } from "@/lib/resume/schema";
import { useResumeStore } from "@/lib/resume/store";

const shape = identificationSchema.shape;

export function IdentificationSection() {
  const { t } = useTranslation();
  const identification = useResumeStore((state) => state.resume.identification);
  const setIdentification = useResumeStore((state) => state.setIdentification);

  return (
    <div className="flex flex-col gap-5">
      <ValidatedInput
        label={t("form.identification.fullName")}
        value={identification.fullName}
        onValueChange={(fullName) => setIdentification({ fullName })}
        schema={shape.fullName}
      />

      {/*
        Optional and free text. Never derived from the name — a name does not
        state anyone's pronouns, and guessing wrong is worse than not showing
        them at all.
      */}
      <ValidatedInput
        label={t("form.identification.pronouns")}
        hint={t("form.identification.pronounsHint")}
        value={identification.pronouns}
        onValueChange={(pronouns) => setIdentification({ pronouns })}
        schema={shape.pronouns}
        optional
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <ValidatedInput
          label={t("form.identification.email")}
          value={identification.email}
          onValueChange={(email) => setIdentification({ email })}
          schema={shape.email}
          type="email"
          inputMode="email"
        />
        <ValidatedInput
          label={t("form.identification.phone")}
          value={identification.phone}
          onValueChange={(phone) => setIdentification({ phone })}
          schema={shape.phone}
          type="tel"
          inputMode="tel"
        />
        <ValidatedInput
          label={t("form.identification.city")}
          value={identification.city}
          onValueChange={(city) => setIdentification({ city })}
          schema={shape.city}
        />
        <ValidatedInput
          label={t("form.identification.state")}
          value={identification.state}
          onValueChange={(state) => setIdentification({ state })}
          schema={shape.state}
        />
      </div>

      <ValidatedInput
        label={t("form.identification.linkedin")}
        hint={t("form.identification.linkHint")}
        value={identification.linkedin}
        onValueChange={(linkedin) => setIdentification({ linkedin })}
        schema={shape.linkedin}
        inputMode="url"
        optional
      />
      <ValidatedInput
        label={t("form.identification.website")}
        value={identification.website}
        onValueChange={(website) => setIdentification({ website })}
        schema={shape.website}
        inputMode="url"
        optional
      />
      <ValidatedInput
        label={t("form.identification.github")}
        value={identification.github}
        onValueChange={(github) => setIdentification({ github })}
        schema={shape.github}
        inputMode="url"
        optional
      />
    </div>
  );
}
