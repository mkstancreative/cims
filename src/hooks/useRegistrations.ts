import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  registerStudent,
  verifyPayment,
  getMyRegistrations,
  getReviewQueue,
  enrollRegistrations,
  rejectRegistration,
  reEnroll,
  payRegistration,
  cancelRegistration,
} from "../api/services/registration";
import type { ReviewQueueParams } from "../api/types/registration";
import { isPaymentRequiredError } from "../helpers/registration";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

// ─── Public registration ──────────────────────────────────────────────────────
export const useRegisterStudent = () => {
  return useMutation({
    mutationFn: registerStudent,
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Registration failed. Please try again.")),
  });
};

export const useVerifyPayment = (reference: string | null) => {
  return useQuery({
    queryKey: ["verify-payment", reference],
    queryFn: () => verifyPayment(reference!),
    enabled: !!reference,
    retry: false,
  });
};

/** `verifyPayment` on demand (e.g. "I've already paid"); the caller reports. */
export const useConfirmPayment = () => {
  return useMutation({
    mutationFn: (reference: string) => verifyPayment(reference),
  });
};

export const useMyRegistrations = () => {
  return useQuery({
    queryKey: ["registrations", "my"],
    queryFn: getMyRegistrations,
    // Also behind the payment gate while the fee is unpaid — don't retry that.
    retry: (failureCount, error) =>
      !isPaymentRequiredError(error) && failureCount < 3,
  });
};

export const useReEnroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reEnroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", "my"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to re-enroll.")),
  });
};

/**
 * Starts or resumes payment for an existing registration, returning a live
 * provider link. Drives the `paymentRequired` login branch.
 */
export const usePayRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payRegistration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", "my"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Could not start payment. Please try again.")),
  });
};

export const useCancelRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelRegistration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      toast.success("Registration cancelled.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to cancel registration.")),
  });
};

// ─── Coordinator / admin review ───────────────────────────────────────────────
export const useReviewQueue = (params?: ReviewQueueParams) => {
  return useQuery({
    queryKey: ["registrations", "queue", params],
    queryFn: () => getReviewQueue(params),
  });
};

/**
 * Bulk enrolment. Resolves with the per-row result even when some — or all —
 * rows failed; the caller decides what to show from `summary.failed`. Only a
 * request rejected outright (bad batch, no duration, validation) errors.
 */
export const useEnrollRegistrations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enrollRegistrations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to enroll registrations.")),
  });
};

export const useRejectRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectRegistration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      toast.success("Registration rejected.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to reject registration.")),
  });
};
