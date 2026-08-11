import { z } from "zod";
import type { TranslationKey } from "@/lib/i18n/types";

/**
 * The resume document.
 *
 * Two rules shape this schema:
 *
 * 1. **Validation guides, it does not gate.** Only formats are checked — an email
 *    that looks like an email, an end date that is not before its start. Almost
 *    nothing is required. Telling someone what their resume is missing is the job
 *    of the ATS checklist in Phase 4, which explains *why* each gap matters.
 *    Refusing to accept an incomplete resume here would only be an obstacle, and
 *    export has to keep working regardless: the data belongs to the user.
 *
 * 2. **Messages are translation keys, not sentences.** TODO.md asks for friendly
 *    errors in pt-BR, and CLAUDE.md § 6 requires every visible string to exist in
 *    both languages. So the schema carries keys and the interface translates them
 *    at render time.
 *
 * No structured field records race, religion, union membership or health,
 * including disability status (CLAUDE.md § 5). Someone applying to a quota
 * vacancy can write that in their own words in the summary; the tool must not
 * turn it into a category it stores and processes.
 */

/** Error keys, checked against the dictionary at compile time. */
export const ERROR = {
  email: "error.email",
  url: "error.url",
  endBeforeStart: "error.endBeforeStart",
  tooLong: "error.tooLong",
} as const satisfies Record<string, TranslationKey>;

export const monthYearSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(1950).max(2100),
});

export type MonthYearValue = z.infer<typeof monthYearSchema>;

/** Sorts as a plain number, which makes chronological comparison trivial. */
export function monthYearToNumber(value: MonthYearValue): number {
  return value.year * 12 + value.month;
}

const optionalText = z.string().max(500, { error: ERROR.tooLong });

const optionalUrl = z
  .string()
  .max(500, { error: ERROR.tooLong })
  .refine((value) => value === "" || /^https?:\/\/\S+\.\S+/.test(value), {
    error: ERROR.url,
  });

export const workModeSchema = z.enum(["onsite", "hybrid", "remote"]);
export type WorkMode = z.infer<typeof workModeSchema>;

export const educationStatusSchema = z.enum([
  "completed",
  "inProgress",
  "interrupted",
]);
export type EducationStatus = z.infer<typeof educationStatusSchema>;

export const identificationSchema = z.object({
  fullName: z.string().max(120, { error: ERROR.tooLong }),
  /** Optional and free text. Never inferred from the name. */
  pronouns: z.string().max(40, { error: ERROR.tooLong }),
  email: z
    .string()
    .max(160, { error: ERROR.tooLong })
    .refine(
      (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      {
        error: ERROR.email,
      },
    ),
  phone: z.string().max(40, { error: ERROR.tooLong }),
  city: z.string().max(80, { error: ERROR.tooLong }),
  state: z.string().max(40, { error: ERROR.tooLong }),
  linkedin: optionalUrl,
  website: optionalUrl,
  github: optionalUrl,
});

/** A date range that may still be running. */
const periodFields = {
  start: monthYearSchema.nullable(),
  end: monthYearSchema.nullable(),
  /** While true, `end` is ignored and the entry reads as ongoing. */
  isCurrent: z.boolean(),
};

const endNotBeforeStart = <
  T extends { start: unknown; end: unknown; isCurrent: boolean },
>(
  entry: T,
) => {
  const { start, end, isCurrent } = entry as {
    start: MonthYearValue | null;
    end: MonthYearValue | null;
    isCurrent: boolean;
  };
  if (isCurrent || start === null || end === null) return true;
  return monthYearToNumber(end) >= monthYearToNumber(start);
};

export const experienceSchema = z
  .object({
    id: z.string(),
    role: z.string().max(120, { error: ERROR.tooLong }),
    company: z.string().max(120, { error: ERROR.tooLong }),
    location: z.string().max(120, { error: ERROR.tooLong }),
    workMode: workModeSchema.nullable(),
    /**
     * Contractor / self-employed work (research § 7.5). Recorded per entry so
     * Phase 6 can advise gathering scattered clients under one umbrella role
     * instead of letting an ATS read them as job hopping.
     */
    isSelfEmployed: z.boolean(),
    ...periodFields,
    /**
     * Achievements as bullet points, never a paragraph. Research § 4: long
     * sentences lose both the tired human reader and the semantic parser, which
     * relies on token distance to link an action to its result.
     */
    bullets: z.array(z.string().max(400, { error: ERROR.tooLong })),
  })
  .refine(endNotBeforeStart, {
    error: ERROR.endBeforeStart,
    path: ["end"],
  });

export const educationSchema = z
  .object({
    id: z.string(),
    institution: z.string().max(160, { error: ERROR.tooLong }),
    course: z.string().max(160, { error: ERROR.tooLong }),
    degree: z.string().max(80, { error: ERROR.tooLong }),
    status: educationStatusSchema.nullable(),
    ...periodFields,
  })
  .refine(endNotBeforeStart, {
    error: ERROR.endBeforeStart,
    path: ["end"],
  });

export const skillSchema = z.object({
  id: z.string(),
  name: z.string().max(80, { error: ERROR.tooLong }),
  /** Optional grouping, e.g. "Ferramentas", "Idiomas de programação". */
  category: z.string().max(80, { error: ERROR.tooLong }),
});

export const languageSchema = z.object({
  id: z.string(),
  name: z.string().max(80, { error: ERROR.tooLong }),
  /**
   * Free text, never a graphical meter. Filled dots and bars are read as Unicode
   * garbage or dropped entirely by the parser (CLAUDE.md § 4, restriction 2).
   */
  level: z.string().max(80, { error: ERROR.tooLong }),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().max(160, { error: ERROR.tooLong }),
  description: optionalText,
  url: optionalUrl,
});

export const certificationSchema = z.object({
  id: z.string(),
  name: z.string().max(160, { error: ERROR.tooLong }),
  issuer: z.string().max(160, { error: ERROR.tooLong }),
  year: z.string().max(10, { error: ERROR.tooLong }),
  url: optionalUrl,
});

export const volunteeringSchema = z.object({
  id: z.string(),
  organization: z.string().max(160, { error: ERROR.tooLong }),
  role: z.string().max(120, { error: ERROR.tooLong }),
  description: optionalText,
});

/**
 * An explained break in the timeline (research § 7.5).
 *
 * Gaps must be stated plainly rather than hidden, since hiding them is what
 * makes the functional format read as evasive. The interface for this arrives in
 * Phase 6; the field exists now so the shape is settled.
 */
export const careerGapSchema = z.object({
  id: z.string(),
  start: monthYearSchema.nullable(),
  end: monthYearSchema.nullable(),
  note: optionalText,
});

/** Academic output, surfaced only when the resume is marked academic. */
export const publicationSchema = z.object({
  id: z.string(),
  title: z.string().max(300, { error: ERROR.tooLong }),
  venue: z.string().max(200, { error: ERROR.tooLong }),
  year: z.string().max(10, { error: ERROR.tooLong }),
  url: optionalUrl,
});

export const resumeSchema = z.object({
  identification: identificationSchema,
  summary: z.string().max(2000, { error: ERROR.tooLong }),
  experiences: z.array(experienceSchema),
  education: z.array(educationSchema),
  skills: z.array(skillSchema),
  languages: z.array(languageSchema),
  projects: z.array(projectSchema),
  certifications: z.array(certificationSchema),
  volunteering: z.array(volunteeringSchema),
  careerGaps: z.array(careerGapSchema),
  /** Switches on the publications section (research § 7.5). Phase 6 wires the UI. */
  isAcademic: z.boolean(),
  publications: z.array(publicationSchema),
});

export type Resume = z.infer<typeof resumeSchema>;
export type Identification = z.infer<typeof identificationSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Language = z.infer<typeof languageSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Volunteering = z.infer<typeof volunteeringSchema>;
export type CareerGap = z.infer<typeof careerGapSchema>;
export type Publication = z.infer<typeof publicationSchema>;
