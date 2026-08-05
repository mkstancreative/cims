// ─── Payment Types ────────────────────────────────────────────────────────────

export type PaymentStatus =
  | "pending"
  | "success"
  | "failed"
  | "abandoned"
  | "reversed"
  | "refunded"
  | "cancelled";

/** Which timestamp column a date range applies to. */
export type PaymentDateField =
  | "createdAt"
  | "paidAt"
  | "verifiedAt"
  | "updatedAt";

export interface PaymentStudentRef {
  _id: string;
  registrationNumber?: string;
  user?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

export interface PaymentRegistrationRef {
  _id: string;
  status?: string;
  type?: string;
  isOpen?: boolean;
  program?: { type: string; level: string };
  payment?: {
    amount: number;
    status: string;
    reference: string;
    references?: string[];
  };
  createdAt?: string;
}

export interface PaymentInstitutionRef {
  _id: string;
  name: string;
  code: string;
}

export interface Payment {
  _id: string;
  /** Provider transaction reference. Supports partial matching when filtering. */
  reference: string;
  /** Credo-side transaction reference. */
  credoReference?: string;
  amount: number;
  currency?: string;
  status: PaymentStatus | string;
  /** e.g. card, bank, ussd, transfer — set by the provider once paid. */
  channel?: string;
  provider?: string;
  /** What the payment is for, e.g. registration / re-enrollment. */
  purpose?: string;
  authorizationUrl?: string;
  paidAt?: string;
  verifiedAt?: string;
  registrationType?: string;
  attemptNumber?: number;
  user?: string | { _id: string };
  student?: string | PaymentStudentRef;
  registration?: string | PaymentRegistrationRef;
  institution?: string | PaymentInstitutionRef;
  program?: { type: string; level: string };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** One entry in the `attempts` array returned by `GET /payments/:id`. */
export interface PaymentAttempt {
  _id: string;
  reference: string;
  attemptNumber: number;
  amount: number;
  status: PaymentStatus | string;
  createdAt: string;
}

/** Shape of `data` in the detailed single-payment endpoint. */
export interface PaymentDetailData {
  payment: Payment;
  attempts: PaymentAttempt[];
}

/**
 * Query parameters accepted by `GET /payments` (and `GET /payments/my`,
 * which ignores the identity filters).
 *
 * Note the three non-obvious ones called out in the API docs:
 *  - `status` accepts a COMMA-SEPARATED list, e.g. "pending,failed".
 *  - `reference` matches PARTIALLY, so a fragment of a reference is enough.
 *  - `dateField` selects which timestamp `startDate`/`endDate` filter on;
 *    without it the range applies to `createdAt`.
 */
export interface PaymentParams {
  // ── Pagination & ordering ──
  page?: number;
  limit?: number;
  /** Field to sort by, e.g. "createdAt" | "amount" | "paidAt". */
  sort?: string;
  order?: "asc" | "desc";

  // ── Identity / relationship filters ──
  student?: string;
  registration?: string;
  institution?: string;

  // ── Attribute filters ──
  /** Comma-separated list — "pending,failed" returns both. */
  status?: string;
  /** Partial match — a fragment of the reference is enough. */
  reference?: string;
  channel?: string;
  provider?: string;
  purpose?: string;
  currency?: string;

  // ── Amount range ──
  minAmount?: number;
  maxAmount?: number;

  // ── Date range ──
  /** Which timestamp the range applies to. Defaults to createdAt. */
  dateField?: PaymentDateField;
  startDate?: string;
  endDate?: string;

  // ── Free text across payer name / email / reference ──
  search?: string;
}

export interface PaymentListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: Payment[];
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  data: PaymentDetailData;
}

export interface PaymentStatusStats {
  count: number;
  amount: number;
  debitedAmount: number;
  settlementAmount: number;
}

export interface PaymentSummaryTotals {
  attempts: number;
  pending: PaymentStatusStats;
  successful: PaymentStatusStats;
  failed: PaymentStatusStats;
  abandoned: PaymentStatusStats;
  collected: number;
  settled: number;
  gatewayFees: number;
  settlementGap: number;
  missingFeeData: number;
  missingSettlementData: number;
}

export interface PaymentSummaryGroupItem {
  _id: string | null;
  attempts: number;
  successful: number;
  collected: number;
  settled: number;
  debited: number;
  missingSettlement: number;
  label: string;
}

export interface PaymentSummaryResponse {
  success: boolean;
  groupBy: string;
  dateField: string;
  totals: PaymentSummaryTotals;
  data: PaymentSummaryGroupItem[];
}

/** `POST /payments/:id/reverify` — re-checks the transaction with the provider. */
export interface ReverifyPaymentResponse {
  success: boolean;
  message?: string;
  data: Payment;
}
