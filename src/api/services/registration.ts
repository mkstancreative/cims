import { api } from "./api";
import type {
  RegisterPayload,
  RegisterResponse,
  RegisterOutcome,
  VerifyPaymentResponse,
  RegistrationListResponse,
  ReviewQueueParams,
  EnrollPayload,
  RejectPayload,
  ReEnrollPayload,
  CancelRegistrationResponse,
  EnrollResponse,
} from "../types/registration";

/**
 * Register and re-enroll both answer 200 (resumed an existing unpaid attempt)
 * or 201 (created / resubmitted). Callers need to tell those apart, so we keep
 * the status code alongside the body instead of discarding it.
 */
function toOutcome(
  data: RegisterResponse,
  httpStatus: number,
): RegisterOutcome {
  return { ...data, httpStatus, resumed: httpStatus === 200 };
}

// Public — self-service registration (returns Credo authorizationUrl)
export const registerStudent = async (
  payload: RegisterPayload,
): Promise<RegisterOutcome> => {
  const response = await api.post("/registrations/register", payload);
  return toOutcome(response.data, response.status);
};

export const verifyPayment = async (
  reference: string,
): Promise<VerifyPaymentResponse> => {
  const response = await api.get("/registrations/verify-payment", {
    params: { reference },
  });
  return response.data;
};

export const getMyRegistrations =
  async (): Promise<RegistrationListResponse> => {
    const response = await api.get("/registrations/my");
    return response.data;
  };

// Coordinator / admin review queue
export const getReviewQueue = async (
  params?: ReviewQueueParams,
): Promise<RegistrationListResponse> => {
  const response = await api.get("/registrations", { params });
  return response.data;
};

/**
 * Enrols 1–200 registrations into one batch. It can PARTLY succeed: the body
 * carries per-row `enrolled` / `failed` lists on a 200 (some went through)
 * and on a 400 (none did) alike, so a 400 with a `summary` is returned, not
 * thrown. Anything else — unknown batch, batch without a duration, bad
 * payload — was rejected before any row ran, and throws.
 */
export const enrollRegistrations = async (
  payload: EnrollPayload,
): Promise<EnrollResponse> => {
  try {
    const response = await api.put<EnrollResponse>(
      "/registrations/enroll",
      payload,
    );
    return response.data;
  } catch (err) {
    const body = (err as { response?: { data?: Partial<EnrollResponse> } })
      .response?.data;
    if (body?.summary && body?.data) return body as EnrollResponse;
    throw err;
  }
};

export const rejectRegistration = async ({ id, reason }: RejectPayload) => {
  const response = await api.put(`/registrations/${id}/reject`, { reason });
  return response.data;
};

export const reEnroll = async (
  payload: ReEnrollPayload,
): Promise<RegisterOutcome> => {
  const response = await api.post("/registrations/re-enroll", payload);
  return toOutcome(response.data, response.status);
};

/**
 * Starts (or resumes) payment for an existing registration and returns a live
 * provider link. Used by the `paymentRequired` login branch, where the student
 * is authenticated but gated behind an unpaid registration.
 */
export const payRegistration = async (
  id: string,
): Promise<RegisterOutcome> => {
  const response = await api.post(`/registrations/${id}/pay`);
  return toOutcome(response.data, response.status);
};

/** Cancels a registration. A cancelled student may register again later. */
export const cancelRegistration = async (
  id: string,
): Promise<CancelRegistrationResponse> => {
  const response = await api.put(`/registrations/${id}/cancel`);
  return response.data;
};
