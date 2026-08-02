import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createQuiz,
  getQuizzes,
  getQuiz,
  updateQuiz,
  deactivateQuiz,
  getMyQuiz,
  submitQuiz,
} from "../api/services/quiz";
import type { QuizParams, SubmitQuizPayload } from "../api/types/quiz";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

export const useQuizzes = (params?: QuizParams) => {
  return useQuery({
    queryKey: ["quizzes", params],
    queryFn: () => getQuizzes(params),
  });
};

export const useQuiz = (id: string) => {
  return useQuery({
    queryKey: ["quizzes", id],
    queryFn: () => getQuiz(id),
    enabled: !!id,
  });
};

export const useMyQuiz = () => {
  return useQuery({
    queryKey: ["quizzes", "my"],
    queryFn: getMyQuiz,
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz created successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to create quiz.")),
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz updated successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to update quiz.")),
  });
};

export const useDeactivateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz deactivated.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to deactivate quiz.")),
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SubmitQuizPayload }) =>
      submitQuiz(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", "my"] });
      queryClient.invalidateQueries({ queryKey: ["my-evaluation"] });
      if (data.data.passed) {
        toast.success(`Quiz passed! Score: ${data.data.score}`);
      } else {
        toast.info(`Quiz submitted. Score: ${data.data.score}`);
      }
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to submit quiz.")),
  });
};
