import type { TranslationKey } from "@/lib/i18n/types";

export interface ResumeSection {
  /** Anchor id, also the fragment used by the section navigation. */
  id: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  /** Present when the section is a list the user extends. */
  addKey?: TranslationKey;
}

/**
 * The sections of the resume form, in the order they appear.
 *
 * Reverse-chronological is the market's gold standard (research section 3.5), so
 * experience precedes education, and both come after the identification a
 * recruiter reads first.
 */
export const RESUME_SECTIONS: readonly ResumeSection[] = [
  {
    id: "identificacao",
    titleKey: "section.identification.title",
    descriptionKey: "section.identification.description",
  },
  {
    id: "resumo",
    titleKey: "section.summary.title",
    descriptionKey: "section.summary.description",
  },
  {
    id: "experiencias",
    titleKey: "section.experience.title",
    descriptionKey: "section.experience.description",
    addKey: "section.experience.add",
  },
  {
    id: "formacao",
    titleKey: "section.education.title",
    descriptionKey: "section.education.description",
    addKey: "section.education.add",
  },
  {
    id: "habilidades",
    titleKey: "section.skills.title",
    descriptionKey: "section.skills.description",
    addKey: "section.skills.add",
  },
  {
    id: "idiomas",
    titleKey: "section.languages.title",
    descriptionKey: "section.languages.description",
    addKey: "section.languages.add",
  },
  {
    id: "extras",
    titleKey: "section.extras.title",
    descriptionKey: "section.extras.description",
    addKey: "section.extras.add",
  },
  {
    id: "revisao",
    titleKey: "section.review.title",
    descriptionKey: "section.review.description",
  },
];
