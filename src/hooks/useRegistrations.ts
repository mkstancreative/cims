import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  registerStudent,
  verifyPayment,
  getMyRegistrations,
  getReviewQueue,
  enrollRegistration,
  rejectRegistration,
  reEnroll,
  payRegistration,
  cancelRegistration,
} from "../api/services/registration";
import type { ReviewQueueParams } from "../api/types/registration";

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

export const useMyRegistrations = () => {
  return useQuery({
    queryKey: ["registrations", "my"],
    queryFn: getMyRegistrations,
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

export const useEnrollRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enrollRegistration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      toast.success("Registration enrolled into batch.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to enroll registration.")),
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
