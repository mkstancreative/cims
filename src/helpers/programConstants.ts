/** Shared programme type / level constants used across Register and ReEnrollForm */

export const PROGRAM_TYPES = [
  "ND",
  "HND",
  "BSc",
  "BNSc",
  "RN",
  "RM",
  "Diploma",
  "Other",
] as const;

export type ProgramType = (typeof PROGRAM_TYPES)[number];

export const PROGRAM_LEVELS_BY_TYPE: Record<string, string[]> = {
  ND: ["ND1", "ND2"],
  HND: ["HND1", "HND2"],
  BSc: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
  BNSc: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
  RN: ["Year 1", "Year 2", "Year 3"],
  RM: ["Year 1", "Year 2"],
  Diploma: ["Year 1", "Year 2", "Year 3"],
  Other: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"],
};

/** Full programme names for formal documents (the certificate). */
export const PROGRAM_NAMES: Record<string, string> = {
  ND: "National Diploma",
  HND: "Higher National Diploma",
  BSc: "Bachelor of Science",
  BNSc: "Bachelor of Nursing Science",
  RN: "Registered Nursing",
  RM: "Registered Midwifery",
  Diploma: "Diploma",
};

/** "ND" → "National Diploma (ND)"; unknown types are shown as given. */
export function programFullName(type?: string): string {
  if (!type) return "";
  const name = PROGRAM_NAMES[type];
  return name && name !== type ? `${name} (${type})` : type;
}
