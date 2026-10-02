import type {
  Internship,
  InternshipBatchRef,
} from "../api/types/internship";
import { formatDate } from "./utilities";

export function studentName(it: Internship): string {
  if (it.student && typeof it.student === "object") {
    const u = it.student.user;
    if (u) return `${u.firstName} ${u.lastName}`.trim();
  }
  return "—";
}

export function batchName(it: Internship): string {
  if (it.batch && typeof it.batch === "object") return it.batch.name;
  return "—";
}

export function supervisorName(it: Internship): string {
  if (it.supervisor && typeof it.supervisor === "object") {
    const u = it.supervisor.user;
    if (u) return `${u.firstName} ${u.lastName}`.trim();
  }
  return "—";
}

// ─── Abandoned internships ────────────────────────────────────────────────────
//
// `abandoned` is set by the server when a newer internship for the same
// student is activated. It is read-only: no logbooks, quiz or evaluation, and
// it can't be chosen in a status control. Activating it again is the only way
// out, and that abandons whichever internship is active instead.

/** Tooltip for an abandoned internship's status. */
export const ABANDONED_HINT = "Closed when a newer internship started.";

export function isAbandoned(status?: string | null): boolean {
  return status === "abandoned";
}

/**
 * The notice to show after an activation closed earlier internships, or null
 * when nothing was superseded. `count` is internships in *other* batches.
 */
export function abandonedNotice(count?: number): string | null {
  if (!count || count <= 0) return null;
  return count === 1
    ? "1 student's earlier internship was closed as abandoned."
    : `${count} students' earlier internships were closed as abandoned.`;
}

// ─── A student's own internships (history / switcher) ─────────────────────────

/** The internship's batch when it arrives populated. */
export function internshipBatch(it: Internship): InternshipBatchRef | undefined {
  return it.batch && typeof it.batch === "object" ? it.batch : undefined;
}

/** The batch's id, whether the batch arrives populated or as a bare id. */
export function internshipBatchId(it: Internship): string | undefined {
  if (!it.batch) return undefined;
  return typeof it.batch === "string" ? it.batch : it.batch._id;
}

export function internshipSession(it: Internship): string | undefined {
  return it.session ?? internshipBatch(it)?.session;
}

/** "New Batch · 2025/2026" — how an internship is named to its student. */
export function internshipLabel(it: Internship): string {
  const name = internshipBatch(it)?.name ?? "Internship";
  const session = internshipSession(it);
  return session ? `${name} · ${session}` : name;
}

/** "1 Aug 2026 – 30 Sep 2026", or "—" with no period. */
export function internshipPeriod(it: Internship): string {
  const period = it.itPeriod ?? internshipBatch(it)?.itPeriod;
  if (!period?.startDate) return "—";
  return `${formatDate(period.startDate)} – ${
    period.endDate ? formatDate(period.endDate) : "—"
  }`;
}
