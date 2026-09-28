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

// ─── Payment gate ─────────────────────────────────────────────────────────────
type ApiError = {
  response?: {
    status?: number;
    data?: { message?: string; paymentRequired?: boolean };
  };
};

/** The server's message on a failed request, or `fallback`. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  return (err as ApiError)?.response?.data?.message ?? fallback;
}

/**
 * True when the API refused a request because the student's registration fee
 * is unpaid. The gate answers 403 with `paymentRequired: true` and "Complete
 * your registration payment to access this resource"; 402 and the message are
 * checked too in case either changes.
 */
export function isPaymentRequiredError(err: unknown): boolean {
  const res = (err as ApiError)?.response;
  if (!res) return false;
  if (res.data?.paymentRequired === true || res.status === 402) return true;
  return /registration payment/i.test(res.data?.message ?? "");
}

const UNPAID_PAYMENT_STATUSES = ["pending", "failed", "abandoned"];

/** The registration still waiting on payment (the newest, if several). */
export function findUnpaidRegistration(
  registrations: Registration[] | undefined,
): Registration | null {
  const unpaid = (registrations ?? []).filter(
    (r) =>
      r.status === "pending_payment" ||
      (r.status === "new" &&
        UNPAID_PAYMENT_STATUSES.includes(r.payment?.status ?? "")),
  );
  unpaid.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return unpaid[0] ?? null;
}
