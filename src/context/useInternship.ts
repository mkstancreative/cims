import { useContext } from "react";
import type { InternshipScope } from "../api/types/internship";
import {
  InternshipContext,
  type InternshipContextType,
} from "./InternshipContextValue";

/** The student's selected internship, and switching between them. */
export const useSelectedInternship = (): InternshipContextType => {
  const context = useContext(InternshipContext);
  if (!context) {
    throw new Error(
      "useSelectedInternship must be used within an InternshipProvider",
    );
  }
  return context;
};

const CURRENT_SCOPE: InternshipScope = {};

/** Params that scope a request to the selected internship. Outside the
 *  student area (no provider) it's the current internship — the default. */
export const useInternshipScope = (): InternshipScope =>
  useContext(InternshipContext)?.scope ?? CURRENT_SCOPE;
