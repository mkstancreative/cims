// ─── Registration & Payment (Credo) Types ─────────────────────────────────────

import type { DurationRef } from "./duration";

export interface NextOfKin {
  name: string;
  relationship: string;
  phone: string;
  address: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  registrationNumber: string;
  departmentName: string;
  programType: string;
  programLevel: string;
  institutionId: string;
  /** The priced period the applicant is buying. Required — no flat fee. */
  durationId: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  stateOfOrigin: string;
  nationality: string;
  nextOfKin: NextOfKin;
  professionalRegNumber?: string;
}

export interface RegisterResult {
  registrationId: string;
  reference: string;
  authorizationUrl: string;
  amount: number;
  /** Mirrored here by some responses — read it via `isRegistrationPaid()`. */
  paid?: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  /** Every register / re-enroll / pay response now carries this. */
  paid?: boolean;
  data: RegisterResult;
}

/**
 * A register or re-enroll call, plus the HTTP status the API answered with.
 *
 * The status is meaningful and the two cases need different messaging:
 *  - 200 — an existing unpaid registration was RESUMED; `authorizationUrl`
 *    is a live link for that same registration.
 *  - 201 — a registration was newly CREATED, or RESUBMITTED for a student
 *    who had previously cancelled.
 *
 * Neither is an error; the old 409 dead end is gone.
 */
export interface RegisterOutcome extends RegisterResponse {
  httpStatus: number;
  /** True when the API answered 200, i.e. we resumed an existing attempt. */
  resumed: boolean;
}

/** `paid` may arrive at the root or nested in `data` — check both. */
export function isRegistrationPaid(res: RegisterResponse): boolean {
  return res.paid === true || res.data?.paid === true;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  data: {
    status: string;
  };
}

export type RegistrationStatus =
  | "new"
  | "enrolled"
  | "rejected"
  | "pending_payment";

export interface RegistrationPayment {
  amount: number;
  status: string;
  reference: string;
  channel?: string;
  paidAt?: string;
}

export interface Registration {
  _id: string;
  program: { type: string; level: string };
  payment: RegistrationPayment;
  student?:
    | string
    | {
        _id: string;
        registrationNumber?: string;
        department?: { name: string; code: string };
        program?: { type: string; level: string };
        user?: {
          _id: string;
          email: string;
          firstName: string;
          lastName: string;
          phone?: string;
        };
      };
  institution?: { _id: string; name: string; code: string } | string;
  /**
   * The tier the student paid for. Populated on `GET /registrations/my` and
   * the review queue; `null` on registrations that predate the feature.
   */
  duration?: DurationRef | null;
  type: string;
  status: RegistrationStatus | string;
  isOpen: boolean;
  batch?: string;
  internship?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationListResponse {
  success: boolean;
  total?: number;
  page?: number;
  pages?: number;
  data: Registration[];
}

export interface ReviewQueueParams {
  status?: string;
  /** Duration `_id` — filter the queue to one priced tier before selecting. */
  duration?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Bulk enrolment — `PUT /registrations/enroll` ────────────────────────────

/** The API refuses more than this many ids in one call. */
export const ENROLL_MAX_IDS = 200;

/** One batch, 1–200 registrations. Enrolling one student is an array of one. */
export interface EnrollPayload {
  batchId: string;
  registrationIds: string[];
}

export type EnrollReason =
  /** No registration with that id — the list is stale. */
  | "NOT_FOUND"
  /** Not awaiting enrolment (already enrolled, rejected, or unpaid). */
  | "NOT_NEW"
  /** The student paid for a different period than this batch runs. */
  | "DURATION_MISMATCH"
  /** Unexpected server error on that row — safe to retry. */
  | "ENROLL_FAILED";

export interface EnrolledRow {
  registration: string;
  student: string;
  internship: string;
  /** The internship already existed; it was synced rather than duplicated. */
  alreadyEnrolled?: boolean;
  /** Pre-durations registration: its period could not be verified. */
  warning?: string;
}

export interface FailedRow {
  registration: string;
  reason: EnrollReason | string;
  /** Written for an admin — render as-is. */
  message: string;
  /** DURATION_MISMATCH only. */
  data?: {
    paidDuration: DurationRef | null;
    batchDuration: DurationRef;
  };
}

/**
 * `200` = at least one row enrolled; `400` with the same shape = none did.
 * Never treat `200` as total success — branch on `summary.failed`.
 *
 * `summary` / `data` are ABSENT when the request was rejected before anything
 * ran (bad batch, batch without a duration, validation) — the service throws
 * for those, so a returned value always carries them.
 */
export interface EnrollResponse {
  success: boolean;
  message: string;
  summary: { total: number; enrolled: number; failed: number };
  data: {
    batch: { _id: string; name: string; session: string };
    enrolled: EnrolledRow[];
    failed: FailedRow[];
  };
}

export interface RejectPayload {
  id: string;
  reason: string;
}

export interface ReEnrollPayload {
  programType: string;
  programLevel: string;
  /** Required. Any ACTIVE duration — including one already taken. */
  durationId: string;
}

/** `PUT /registrations/:id/cancel` — a cancelled student may register again. */
export interface CancelRegistrationResponse {
  success: boolean;
  message?: string;
  data?: Registration;
}
