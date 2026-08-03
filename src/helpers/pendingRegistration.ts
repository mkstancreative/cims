import type { PendingRegistration } from "../api/types/auth";

const PENDING_KEY = "siwes_pending_registration";

/**
 * The `paymentRequired` login branch hands us the pending registration once,
 * in the login response. We persist it so a page refresh on the payment screen
 * — or a return trip from the provider — doesn't lose what we're paying for.
 */
export function storePendingRegistration(
  pending: PendingRegistration | null,
): void {
  if (!pending) {
    localStorage.removeItem(PENDING_KEY);
    return;
  }
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function getPendingRegistration(): PendingRegistration | null {
  try {
    const stored = localStorage.getItem(PENDING_KEY);
    return stored ? (JSON.parse(stored) as PendingRegistration) : null;
  } catch {
    return null;
  }
}

export function clearPendingRegistration(): void {
  localStorage.removeItem(PENDING_KEY);
}

/** The API uses `registrationId` in some payloads and `_id` in others. */
export function pendingRegistrationId(
  pending: PendingRegistration | null,
): string | null {
  return pending?.registrationId ?? pending?._id ?? null;
}
