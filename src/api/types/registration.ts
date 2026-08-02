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
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  data: RegisterResult;
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
