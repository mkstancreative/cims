import { api } from "./api";
import type {
  PaymentParams,
  PaymentListResponse,
  PaymentResponse,
  PaymentSummaryResponse,
  ReverifyPaymentResponse,
} from "../types/payment";

/**
 * Strips empty values so we never send `?status=&reference=` — the API treats
 * an empty string as a real filter and would return nothing.
 */
function cleanParams(params?: PaymentParams): Record<string, unknown> {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== undefined && value !== null,
    ),
  );
}

// ─── Admin / coordinator ──────────────────────────────────────────────────────

export const getPayments = async (
  params?: PaymentParams,
): Promise<PaymentListResponse> => {
  const response = await api.get("/payments", { params: cleanParams(params) });
  return response.data;
};

export const getPaymentSummary = async (
  params?: PaymentParams,
): Promise<PaymentSummaryResponse> => {
  const response = await api.get("/payments/summary", {
    params: cleanParams(params),
  });
  return response.data;
};

export const getPayment = async (id: string): Promise<PaymentResponse> => {
  const response = await api.get(`/payments/${id}`);
  return response.data;
};

/** Re-checks a transaction with the provider and syncs the stored status. */
export const reverifyPayment = async (
  id: string,
): Promise<ReverifyPaymentResponse> => {
  const response = await api.post(`/payments/${id}/reverify`);
  return response.data;
};

// ─── Student ──────────────────────────────────────────────────────────────────

export const getMyPayments = async (
  params?: PaymentParams,
): Promise<PaymentListResponse> => {
  const response = await api.get("/payments/my", {
    params: cleanParams(params),
  });
  return response.data;
};
