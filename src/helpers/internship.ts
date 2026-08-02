import type { Internship } from "../api/types/internship";

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
