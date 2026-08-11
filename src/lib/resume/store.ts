import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { emptyResume } from "./empty";
import type { SaveOutcome } from "./persistence";
import type { Identification, Resume } from "./schema";

/**
 * The resume being edited.
 *
 * Zustand rather than a Context holding the whole document: a single context
 * re-renders every subscriber on each keystroke, and with nine sections and
 * several repeatable blocks that means re-rendering the entire form per
 * character — on the modest phone much of this audience is using. Selectors here
 * mean a field re-renders only itself.
 *
 * Read it with a narrow selector. Lists should subscribe to their ids and let
 * each card subscribe to its own entry (see `useListIds` / `useEntry`), so
 * typing in one experience does not re-render the others.
 */

/** Keys of Resume whose value is an array of entries carrying an `id`. */
type ListKey =
  | "experiences"
  | "education"
  | "skills"
  | "languages"
  | "projects"
  | "certifications"
  | "volunteering"
  | "careerGaps"
  | "publications";

type EntryOf<K extends ListKey> = Resume[K][number];

interface ResumeState {
  resume: Resume;
  /** True once anything has been edited or restored — used to skip the first save. */
  touched: boolean;

  /**
   * When a previous session was recovered, and whether saving is currently
   * failing. Kept in the store rather than in component state so the effect that
   * loads and saves never calls a React setState — and so any part of the app
   * can tell the user that their work is not being kept.
   */
  restoredAt: string | null;
  storageProblem: SaveOutcome | null;
  setRestoredAt: (value: string | null) => void;
  setStorageProblem: (value: SaveOutcome | null) => void;

  setIdentification: (patch: Partial<Identification>) => void;
  setSummary: (summary: string) => void;
  setIsAcademic: (isAcademic: boolean) => void;

  addEntry: <K extends ListKey>(key: K, entry: EntryOf<K>) => void;
  updateEntry: <K extends ListKey>(
    key: K,
    id: string,
    patch: Partial<EntryOf<K>>,
  ) => void;
  removeEntry: (key: ListKey, id: string) => void;
  moveEntry: (key: ListKey, from: number, to: number) => void;

  /** Wholesale replacement, for restoring a save or importing a JSON file. */
  replaceResume: (resume: Resume, options?: { touched?: boolean }) => void;
  clearAll: () => void;
}

export const useResumeStore = create<ResumeState>()((set) => ({
  resume: emptyResume(),
  touched: false,
  restoredAt: null,
  storageProblem: null,

  setRestoredAt: (restoredAt) => set({ restoredAt }),
  setStorageProblem: (storageProblem) => set({ storageProblem }),

  setIdentification: (patch) =>
    set((state) => ({
      touched: true,
      resume: {
        ...state.resume,
        identification: { ...state.resume.identification, ...patch },
      },
    })),

  setSummary: (summary) =>
    set((state) => ({ touched: true, resume: { ...state.resume, summary } })),

  setIsAcademic: (isAcademic) =>
    set((state) => ({
      touched: true,
      resume: { ...state.resume, isAcademic },
    })),

  addEntry: (key, entry) =>
    set((state) => ({
      touched: true,
      resume: { ...state.resume, [key]: [...state.resume[key], entry] },
    })),

  updateEntry: (key, id, patch) =>
    set((state) => ({
      touched: true,
      resume: {
        ...state.resume,
        [key]: state.resume[key].map((entry) =>
          entry.id === id ? { ...entry, ...patch } : entry,
        ),
      },
    })),

  removeEntry: (key, id) =>
    set((state) => ({
      touched: true,
      resume: {
        ...state.resume,
        [key]: state.resume[key].filter((entry) => entry.id !== id),
      },
    })),

  moveEntry: (key, from, to) =>
    set((state) => {
      const list = [...state.resume[key]];
      if (to < 0 || to >= list.length) return state;
      const [moved] = list.splice(from, 1);
      if (moved === undefined) return state;
      list.splice(to, 0, moved);
      return { touched: true, resume: { ...state.resume, [key]: list } };
    }),

  replaceResume: (resume, options) =>
    set({ resume, touched: options?.touched ?? true }),

  clearAll: () => set({ resume: emptyResume(), touched: true }),
}));

/**
 * Ids of a list, as a stable-length array.
 *
 * Subscribing to the ids rather than the entries means adding, removing or
 * reordering re-renders the list, while editing a field inside one entry does
 * not.
 */
export function useListIds(key: ListKey): string[] {
  // useShallow is required, not stylistic: the selector builds a new array every
  // call, and without a shallow comparison Zustand sees a changed snapshot on
  // every render and loops forever.
  return useResumeStore(
    useShallow((state) => state.resume[key].map((entry) => entry.id)),
  );
}

/**
 * A single entry, so a card re-renders only when its own data changes.
 *
 * Returns undefined for an id that is no longer in the list — which happens for
 * one render after a removal, while the parent has yet to re-render.
 */
export function useEntry<K extends ListKey>(
  key: K,
  id: string,
): EntryOf<K> | undefined {
  return useResumeStore((state) =>
    state.resume[key].find((entry) => entry.id === id),
  ) as EntryOf<K> | undefined;
}
