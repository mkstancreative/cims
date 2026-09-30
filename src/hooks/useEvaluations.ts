import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getPendingEvaluations,
  submitEvaluation,
  getMyEvaluation,
  getStudentEvaluations,
  getCompositeResults,
  verifyEvaluation,
} from "../api/services/evaluation";
import type {
  SubmitEvaluationPayload,
  CompositeResultsParams,
  EvaluationSubmitError,
  EvaluationVerifyParams,
} from "../api/types/evaluation";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

export const usePendingEvaluations = () => {
  return useQuery({
    queryKey: ["evaluations", "pending"],
    queryFn: getPendingEvaluations,
  });
};

export const useMyEvaluation = () => {
  return useQuery({
    queryKey: ["my-evaluation"],
    queryFn: getMyEvaluation,
  });
};

export const useStudentEvaluations = (studentId: string) => {
  return useQuery({
    queryKey: ["evaluations", "student", studentId],
    queryFn: () => getStudentEvaluations(studentId),
    enabled: !!studentId,
  });
};

export const useCompositeResults = (params?: CompositeResultsParams) => {
  return useQuery({
    queryKey: ["evaluations", "composite", params],
    queryFn: () => getCompositeResults(params),
  });
};

/**
 * The evaluation preflight. A snapshot, not a lock — curriculum progress and
 * quiz scores move underneath an open form, so it refetches on focus and the
 * form re-runs it right before submitting.
 */
export const useEvaluationVerify = (
  studentId: string,
  params?: EvaluationVerifyParams,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["evaluations", "verify", studentId, params],
    queryFn: () => verifyEvaluation(studentId, params),
    enabled: enabled && !!studentId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    // 400/403/404 are answers (bad id, not your student…) — don't retry.
    retry: (count, err) => {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      return !(status && status >= 400 && status < 500) && count < 2;
    },
  });
};

/** The body of a refused submit, if the request was refused. */
export function evaluationSubmitError(
  err: unknown,
): EvaluationSubmitError | undefined {
  return (err as { response?: { data?: EvaluationSubmitError } })?.response
    ?.data;
}

export const useSubmitEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      payload,
    }: {
      studentId: string;
      payload: SubmitEvaluationPayload;
    }) => submitEvaluation(studentId, payload),
    onSuccess: (res: { message?: string } | undefined) => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
      toast.success(res?.message ?? "Evaluation submitted successfully!");
    },
    onError: (err: unknown) => {
      // A gate that needs the supervisor's confirmation isn't a failure —
      // the form re-verifies and asks.
      if (evaluationSubmitError(err)?.requiresConfirmation) return;
      toast.error(getErrMsg(err, "Failed to submit evaluation."));
    },
  });
};
