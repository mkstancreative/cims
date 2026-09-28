import type { BatchSupervisorRef } from "../api/types/batch";

/** "Ngozi Adeyemi", or null when nobody is assigned. */
export function supervisorName(
  supervisor: BatchSupervisorRef | null | undefined,
): string | null {
  const u = supervisor?.user;
  if (!u) return null;
  return `${u.firstName} ${u.lastName}`.trim() || null;
}

/** Work number on the staff record first, then the account's. */
export function supervisorPhone(
  supervisor: BatchSupervisorRef | null | undefined,
): string | null {
  return supervisor?.phone || supervisor?.user?.phone || null;
}

/**
 * True when the batch points at a deactivated supervisor — a name shows, but
 * nobody is actually covering the batch. (Only the detail endpoint says.)
 */
export function supervisorInactive(
  supervisor: BatchSupervisorRef | null | undefined,
): boolean {
  return supervisor?.isActive === false;
}
