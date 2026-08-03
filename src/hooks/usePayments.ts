import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getPayments,
  getPaymentSummary,
  getPayment,
  getMyPayments,
  reverifyPayment,
} from "../api/services/payment";
import { getApiErrorMessage } from "../api/services/api";
import type { PaymentParams } from "../api/types/payment";

// ─── Admin / coordinator ──────────────────────────────────────────────────────

export const usePayments = (params?: PaymentParams) => {
  return useQuery({
    queryKey: ["payments", "list", params],
    queryFn: () => getPayments(params),
  });
};

export const usePaymentSummary = (params?: PaymentParams) => {
  return useQuery({
    queryKey: ["payments", "summary", params],
    queryFn: () => getPaymentSummary(params),
  });
};

export const usePayment = (id: string | null) => {
  return useQuery({
    queryKey: ["payments", "detail", id],
    queryFn: () => getPayment(id!),
    enabled: !!id,
  });
};

/**
 * Re-checks a transaction with the provider. Used when a payment is stuck as
 * pending because the provider callback never landed.
 */
export const useReverifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reverifyPayment,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      const status = response.data?.status;
      toast.success(
        status
          ? `Payment re-verified — status is now "${status}".`
          : "Payment re-verified.",
      );
    },
    onError: (err: unknown) =>
      toast.error(getApiErrorMessage(err, "Failed to re-verify payment.")),
  });
};

// ─── Student ──────────────────────────────────────────────────────────────────

export const useMyPayments = (params?: PaymentParams) => {
  return useQuery({
    queryKey: ["payments", "my", params],
    queryFn: () => getMyPayments(params),
  });
};
