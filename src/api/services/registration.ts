import { api } from "./api";
import type {
  RegisterPayload,
  RegisterResponse,
  VerifyPaymentResponse,
  RegistrationListResponse,
  ReviewQueueParams,
  EnrollPayload,
  RejectPayload,
  ReEnrollPayload,
} from "../types/registration";

// Public — self-service registration (returns Credo authorizationUrl)
export const registerStudent = async (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  const response = await api.post("/registrations/register", payload);
  return response.data;
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

export const enrollRegistration = async ({ id, batchId }: EnrollPayload) => {
  const response = await api.put(`/registrations/${id}/enroll`, { batchId });
  return response.data;
};

export const rejectRegistration = async ({ id, reason }: RejectPayload) => {
  const response = await api.put(`/registrations/${id}/reject`, { reason });
  return response.data;
};

export const reEnroll = async (
  payload: ReEnrollPayload,
): Promise<RegisterResponse> => {
  const response = await api.post("/registrations/re-enroll", payload);
  return response.data;
};
