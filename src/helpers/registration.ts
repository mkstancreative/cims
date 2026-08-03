import type { Registration } from "../api/types/registration";

export function applicantName(reg: Registration): string {
  if (reg.student && typeof reg.student === "object") {
    const u = reg.student.user;
    if (u) return `${u.firstName} ${u.lastName}`.trim();
  }
  return "—";
}

export function regNumber(reg: Registration): string {
  if (reg.student && typeof reg.student === "object") {
    return reg.student.registrationNumber ?? "—";
  }
  return "—";
}

export function institutionName(reg: Registration): string {
  if (reg.institution && typeof reg.institution === "object") {
    return reg.institution.name;
  }
  return "—";
}
