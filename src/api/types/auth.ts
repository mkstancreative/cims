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

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
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
