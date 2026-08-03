// ─── Auth Types ───────────────────────────────────────────────────────────────

export type UserRole = "student" | "admin" | "coordinator" | "supervisor";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  mustChangePassword?: boolean;
}

/**
 * Returned on the `paymentRequired` login branch: the student authenticated
 * but has a registration still awaiting payment.
 */
export interface PendingRegistration {
  registrationId?: string;
  _id?: string;
  reference?: string;
  amount?: number;
  /** A live provider link, when the previous attempt is still resumable. */
  authorizationUrl?: string;
  status?: string;
  program?: { type: string; level: string };
  createdAt?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  /**
   * When true the login succeeded but the account is gated behind an unpaid
   * registration: `data.refreshToken` is ABSENT and `data.pendingRegistration`
   * describes what to pay for. Never assume a refresh token comes back.
   */
  paymentRequired?: boolean;
  data: {
    accessToken: string;
    /** Absent on the `paymentRequired` branch. */
    refreshToken?: string;
    user: AuthUser;
    paymentRequired?: boolean;
    pendingRegistration?: PendingRegistration;
  };
}

/** `paymentRequired` may arrive at the root or nested in `data`. */
export function isPaymentRequired(res: LoginResponse): boolean {
  return res.paymentRequired === true || res.data?.paymentRequired === true;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
}

// ─── Request Payloads ─────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  /** Client-side confirmation only — not sent to the API. */
  confirmPassword?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ─── Get Me (full profile) ───────────────────────────────────────────────────
export interface MeUserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface MeDepartment {
  name: string;
  code: string;
}

export interface MeProgram {
  type: string;
  level: string;
}

export interface MeITPeriod {
  startDate: string;
  endDate: string;
  expectedDuration: number;
}

export interface MeInstitution {
  _id: string;
  name: string;
  code: string;
  address?: string;
}

export interface MeSupervisor {
  _id: string;
  staffId?: string;
  specialization?: string;
}

export interface MeSupervisors {
  school?: MeSupervisor;
}

export interface MeNextOfKin {
  name: string;
  relationship: string;
  phone: string;
  address: string;
}

export interface MeBatch {
  _id: string;
  name: string;
  session: string;
}

export interface MeProfile {
  _id: string;
  registrationNumber: string;
  session?: string;
  itStatus?: "placed" | "active" | "completed";
  passportPhoto?: string;
  department?: MeDepartment;
  program?: MeProgram;
  itPeriod?: MeITPeriod;
  institution?: MeInstitution;
  supervisors?: MeSupervisors;
  nextOfKin?: MeNextOfKin;
  batch?: MeBatch;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  stateOfOrigin?: string;
  nationality?: string;
  professionalRegNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetMeResponse {
  success: boolean;
  data: {
    user: MeUserInfo;
    profile: MeProfile | null;
  };
}
