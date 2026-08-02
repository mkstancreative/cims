import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getPendingEvaluations,
  submitEvaluation,
  getMyEvaluation,
  getStudentEvaluations,
  getCompositeResults,
} from "../api/services/evaluation";
import type {
  SubmitEvaluationPayload,
  CompositeResultsParams,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
      toast.success("Evaluation submitted successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to submit evaluation.")),
  });
};
