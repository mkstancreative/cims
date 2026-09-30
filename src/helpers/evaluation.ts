import type { PendingEvaluationsResponse } from "../api/types/evaluation";

/** One row of `GET /evaluations/pending`. */
export type PendingEvaluationRow = PendingEvaluationsResponse["data"][number];

/** The student's name, whether the row carries `user` names or a flat `name`. */
export function pendingStudentName(row: PendingEvaluationRow): string {
  const u = row.student?.user;
  const name = `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim();
  return name || row.student?.name || "—";
}

/** The student's department name — it arrives as `{ name, code }` or a string. */
export function pendingDepartment(row: PendingEvaluationRow): string {
  const dept = row.student?.department;
  if (!dept) return "—";
  return typeof dept === "string" ? dept : (dept.name ?? "—");
}
