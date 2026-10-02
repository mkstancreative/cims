import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./useAuth";
import { useMyInternshipHistory } from "../hooks/useInternships";
import { internshipBatchId, isAbandoned } from "../helpers/internship";
import type { Internship, InternshipScope } from "../api/types/internship";
import {
  InternshipContext,
  selectionKey,
  type InternshipContextType,
} from "./InternshipContextValue";

const NO_INTERNSHIPS: Internship[] = [];
const CURRENT_SCOPE: InternshipScope = {};

/**
 * Which of the student's internships the student pages show. Defaults to the
 * current internship; the top-bar switcher changes it, and every
 * internship-scoped request (dashboard, logbooks, quiz, evaluation,
 * certificate) follows.
 */
export function InternshipProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = user?.id ? selectionKey(user.id) : null;
  const { data, isLoading } = useMyInternshipHistory();
  const internships = data?.data ?? NO_INTERNSHIPS;

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    try {
      return storageKey ? sessionStorage.getItem(storageKey) : null;
    } catch {
      return null;
    }
  });

  const select = useCallback(
    (internshipId: string) => {
      setSelectedId(internshipId);
      try {
        if (storageKey) sessionStorage.setItem(storageKey, internshipId);
      } catch {
        /* storage blocked — the choice lasts until reload */
      }
    },
    [storageKey],
  );

  const selectCurrent = useCallback(() => {
    setSelectedId(null);
    try {
      if (storageKey) sessionStorage.removeItem(storageKey);
    } catch {
      /* storage blocked */
    }
  }, [storageKey]);

  const value = useMemo<InternshipContextType>(() => {
    const current = internships.find((i) => i.isCurrent);
    // A saved id that no longer resolves falls back to the current one.
    const selected =
      (selectedId && internships.find((i) => i._id === selectedId)) ||
      current;
    const isCurrent = !selected || selected._id === current?._id;
    const batchId = selected ? internshipBatchId(selected) : undefined;

    return {
      internships,
      isLoading,
      selected,
      current,
      isCurrent,
      readOnly: !isCurrent || isAbandoned(selected?.itStatus),
      scope:
        isCurrent || !selected
          ? CURRENT_SCOPE
          : { internshipId: selected._id, ...(batchId && { batchId }) },
      select,
      selectCurrent,
    };
  }, [internships, isLoading, selectedId, select, selectCurrent]);

  return (
    <InternshipContext.Provider value={value}>
      {children}
    </InternshipContext.Provider>
  );
}
