import { createContext } from "react";
import type { Internship, InternshipScope } from "../api/types/internship";

export interface InternshipContextType {
  /** All of the student's internships, newest first as the API sends them. */
  internships: Internship[];
  isLoading: boolean;
  /** The internship the student is looking at — the current one until they
   *  switch. Undefined only before the history loads (or with none). */
  selected?: Internship;
  current?: Internship;
  /** Looking at the current internship. True until the history loads. */
  isCurrent: boolean;
  /** A past or abandoned internship — view only, no new records. */
  readOnly: boolean;
  /** Params for every internship-scoped request. Empty for the current
   *  internship, so its requests and cache keys don't change when the
   *  history arrives. */
  scope: InternshipScope;
  select: (internshipId: string) => void;
  selectCurrent: () => void;
}

export const InternshipContext = createContext<
  InternshipContextType | undefined
>(undefined);

// The selection is per browser tab (sessionStorage), so a reload keeps it.
const STORAGE_PREFIX = "cims-internship:";

export const selectionKey = (userId: string) => `${STORAGE_PREFIX}${userId}`;

/** Forget any saved selection. Called on login and logout, so every sign-in
 *  starts on the current internship. */
export function clearSelectedInternship() {
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) sessionStorage.removeItem(key);
    }
  } catch {
    /* storage blocked — nothing was saved */
  }
}
