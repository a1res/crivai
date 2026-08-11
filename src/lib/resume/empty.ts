import type {
  CareerGap,
  Certification,
  Education,
  Experience,
  Language,
  Project,
  Publication,
  Resume,
  Skill,
  Volunteering,
} from "./schema";

/**
 * Blank values for the resume and for each kind of repeatable entry.
 *
 * Every text field starts as "" rather than undefined, so each input is
 * controlled from the first render. Mixing controlled and uncontrolled inputs is
 * how React silently drops what someone typed.
 */

/**
 * Ids are generated here, never during render — a fresh id on every render would
 * remount the card and take the focus out of the field being typed in.
 */
function newId(): string {
  return crypto.randomUUID();
}

export function emptyResume(): Resume {
  return {
    identification: {
      fullName: "",
      pronouns: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      linkedin: "",
      website: "",
      github: "",
    },
    summary: "",
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    certifications: [],
    volunteering: [],
    careerGaps: [],
    isAcademic: false,
    publications: [],
  };
}

export function emptyExperience(): Experience {
  return {
    id: newId(),
    role: "",
    company: "",
    location: "",
    workMode: null,
    isSelfEmployed: false,
    start: null,
    end: null,
    isCurrent: false,
    // Starts with one empty bullet, so the shape of the answer is visible
    // instead of an empty area the user has to guess how to fill.
    bullets: [""],
  };
}

export function emptyEducation(): Education {
  return {
    id: newId(),
    institution: "",
    course: "",
    degree: "",
    status: null,
    start: null,
    end: null,
    isCurrent: false,
  };
}

export function emptySkill(): Skill {
  return { id: newId(), name: "", category: "" };
}

export function emptyLanguage(): Language {
  return { id: newId(), name: "", level: "" };
}

export function emptyProject(): Project {
  return { id: newId(), name: "", description: "", url: "" };
}

export function emptyCertification(): Certification {
  return { id: newId(), name: "", issuer: "", year: "", url: "" };
}

export function emptyVolunteering(): Volunteering {
  return { id: newId(), organization: "", role: "", description: "" };
}

export function emptyCareerGap(): CareerGap {
  return { id: newId(), start: null, end: null, note: "" };
}

export function emptyPublication(): Publication {
  return { id: newId(), title: "", venue: "", year: "", url: "" };
}
