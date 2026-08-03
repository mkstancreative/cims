import type {
  Payment,
  PaymentStudentRef,
  PaymentSummaryData,
} from "../api/types/payment";

/** Formats an amount in Naira. Amounts come from the API in major units. */
export function formatAmount(
  amount?: number,
  currency = "NGN",
): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return "—";
  }
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Unknown currency code — fall back to a plain grouped number.
    return `${currency} ${amount.toLocaleString("en-NG")}`;
  }
}

/** Reads the payer's name off a payment, whose refs may be unpopulated ids. */
export function payerName(payment: Payment): string {
  const student = payment.student;
  if (student && typeof student === "object") {
    const u = (student as PaymentStudentRef).user;
    if (u) return `${u.firstName} ${u.lastName}`.trim();
  }
  return "—";
}

export function payerRegNumber(payment: Payment): string {
  const student = payment.student;
  if (student && typeof student === "object") {
    return (student as PaymentStudentRef).registrationNumber ?? "—";
  }
  return "—";
}

export function institutionName(payment: Payment): string {
  const institution = payment.institution;
  if (institution && typeof institution === "object") {
    return institution.name;
  }
  return "—";
}

/** A payment stuck in a non-final state is the one worth re-verifying. */
export function canReverify(payment: Payment): boolean {
  const status = String(payment.status).toLowerCase();
  return status !== "success" && status !== "refunded";
}

/**
 * The summary endpoint may report totals directly or only as a `byStatus`
 * breakdown, so derive whichever half is missing rather than showing zeros.
 */
export function normalizeSummary(data?: PaymentSummaryData) {
  const buckets = data?.byStatus ?? [];
  const bucketFor = (status: string) =>
    buckets.find((b) => b.status?.toLowerCase() === status);

  const sum = (pick: (b: { count: number; amount: number }) => number) =>
    buckets.reduce((total, b) => total + (pick(b) || 0), 0);

  const success = bucketFor("success");
  const pending = bucketFor("pending");
  const failed = bucketFor("failed");

  return {
    totalCount: data?.totalCount ?? sum((b) => b.count),
    totalAmount: data?.totalAmount ?? sum((b) => b.amount),
    paidCount: data?.paidCount ?? success?.count ?? 0,
    paidAmount: data?.paidAmount ?? success?.amount ?? 0,
    pendingCount: data?.pendingCount ?? pending?.count ?? 0,
    pendingAmount: data?.pendingAmount ?? pending?.amount ?? 0,
    failedCount: data?.failedCount ?? failed?.count ?? 0,
    byStatus: buckets,
  };
}
