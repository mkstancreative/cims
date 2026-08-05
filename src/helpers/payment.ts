import type {
  Payment,
  PaymentStudentRef,
  PaymentSummaryResponse,
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
 * Normalizes the updated payment summary response metrics.
 */
export function normalizeSummary(response?: PaymentSummaryResponse) {
  const totals = response?.totals;
  return {
    totalCount: totals?.attempts ?? 0,
    paidCount: totals?.successful?.count ?? 0,
    paidAmount: totals?.collected ?? 0,
    pendingCount: totals?.pending?.count ?? 0,
    pendingAmount: totals?.pending?.amount ?? 0,
    failedCount: totals?.failed?.count ?? 0,
    abandonedCount: totals?.abandoned?.count ?? 0,
    settledAmount: totals?.settled ?? 0,
    gatewayFees: totals?.gatewayFees ?? 0,
    settlementGap: totals?.settlementGap ?? 0,
  };
}
