// ─── Registration & Payment (Credo) Types ─────────────────────────────────────

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
  page?: number;
  limit?: number;
}

export interface EnrollPayload {
  id: string;
  batchId: string;
}

export interface RejectPayload {
  id: string;
  reason: string;
}

export interface ReEnrollPayload {
  programType: string;
  programLevel: string;
}

/** `PUT /registrations/:id/cancel` — a cancelled student may register again. */
export interface CancelRegistrationResponse {
  success: boolean;
  message?: string;
  data?: Registration;
}
