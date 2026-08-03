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
  program?: { type: string; level: string };
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
  student?: string | PaymentStudentRef;
  registration?: string | PaymentRegistrationRef;
  institution?: string | PaymentInstitutionRef;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
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
  data: Payment;
}

/** One row of the status breakdown returned by `GET /payments/summary`. */
export interface PaymentSummaryBucket {
  status: string;
  count: number;
  amount: number;
}

export interface PaymentSummaryData {
  totalCount?: number;
  totalAmount?: number;
  /** Amount actually collected (successful payments only). */
  paidAmount?: number;
  paidCount?: number;
  pendingAmount?: number;
  pendingCount?: number;
  failedCount?: number;
  byStatus?: PaymentSummaryBucket[];
}

export interface PaymentSummaryResponse {
  success: boolean;
  data: PaymentSummaryData;
}

/** `POST /payments/:id/reverify` — re-checks the transaction with the provider. */
export interface ReverifyPaymentResponse {
  success: boolean;
  message?: string;
  data: Payment;
}
