import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createQuiz,
  getQuizzes,
  getQuiz,
  updateQuiz,
  reorderQuizQuestions,
  getMyQuiz,
  getMyQuizSummary,
  submitQuiz,
} from "../api/services/quiz";
import { isQuizSittingInProgress } from "./useQuizSessions";
import type {
  QuizParams,
  QuizResponse,
  SubmitQuizPayload,
} from "../api/types/quiz";

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

/**
 * The student's quiz overview for the dashboard. Safe to poll — it never
 * carries the paper — so it refreshes while the student waits on a sitting.
 */
export const useMyQuizSummary = (enabled = true) => {
  return useQuery({
    queryKey: ["quizzes", "my", "summary"],
    queryFn: getMyQuizSummary,
    enabled,
    refetchInterval: 60_000,
    retry: (count, err) => {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      return !(status && status >= 400 && status < 500) && count < 2;
    },
  });
};

/**
 * The quiz PAPER — questions and options. Only fetch it once the student
 * presses Start (`enabled`); everything shown before that comes from the
 * question-free `/quiz-sessions/my` and `/quizzes/my/summary`.
 */
export const useMyQuiz = (enabled = true) => {
  return useQuery({
    queryKey: ["quizzes", "my"],
    queryFn: getMyQuiz,
    enabled,
    // Never refetch the paper behind the student's back mid-quiz.
    refetchOnWindowFocus: false,
    // A 400 (e.g. INTERNSHIP_ABANDONED) is an answer, not a blip — don't retry.
    retry: (count, err) => {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      return !(status && status >= 400 && status < 500) && count < 3;
    },
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
    onError: (err: unknown) => {
      // Refused mid-sitting: the message names the batch and the fix.
      if (isQuizSittingInProgress(err))
        queryClient.invalidateQueries({ queryKey: ["quiz-sessions"] });
      toast.error(getErrMsg(err, "Failed to update quiz."));
    },
  });
};

/**
 * Writes the server's new order straight into the quiz cache (the response
 * carries full question objects), and surfaces the past-attempts `warning`.
 */
export const useReorderQuizQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderQuizQuestions,
    onSuccess: (res, { id }) => {
      queryClient.setQueryData<QuizResponse>(["quizzes", id], (old) =>
        old ? { ...old, data: { ...old.data, questions: res.data.questions } } : old,
      );
      if (res.warning) toast.warn(res.warning, { autoClose: 10000 });
    },
    onError: (err: unknown) => {
      if (isQuizSittingInProgress(err))
        queryClient.invalidateQueries({ queryKey: ["quiz-sessions"] });
      toast.error(getErrMsg(err, "Failed to reorder questions."));
    },
  });
};

/** The recorded result on a 409 ALREADY_SUBMITTED from submit, if any. */
export function quizSubmitAttempt(
  err: unknown,
): { score: number; passed: boolean } | null {
  const res = (
    err as {
      response?: {
        status?: number;
        data?: { code?: string; data?: { attempt?: { score?: number; passed?: boolean } } };
      };
    }
  )?.response;
  const attempt = res?.data?.data?.attempt;
  if (
    (res?.status === 409 || res?.data?.code === "ALREADY_SUBMITTED") &&
    typeof attempt?.score === "number"
  )
    return { score: attempt.score, passed: Boolean(attempt.passed) };
  return null;
}

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
      token,
    }: {
      id: string;
      payload: SubmitQuizPayload;
      /** Only on the automatic submit when time runs out. */
      token?: string | null;
    }) => submitQuiz(id, payload, token),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", "my"] });
      queryClient.invalidateQueries({ queryKey: ["my-evaluation"] });
      if (data.data.passed) {
        toast.success(`Quiz passed! Score: ${data.data.score}`);
      } else {
        toast.info(`Quiz submitted. Score: ${data.data.score}`);
      }
    },
    onError: (err: unknown) => {
      // 409 ALREADY_SUBMITTED isn't a failure — the recorded result comes
      // back on `data.attempt` and the quiz screen shows the score.
      if (quizSubmitAttempt(err)) {
        toast.info("You've already taken this quiz — here's your result.");
      } else {
        toast.error(getErrMsg(err, "Failed to submit quiz."));
      }
      // A refused submit carries a lock `code` — the gate state has moved on
      // (the sitting closed, they were never marked present), so refetch so
      // the page stops offering a quiz they cannot take.
      queryClient.invalidateQueries({ queryKey: ["quizzes", "my"] });
      queryClient.invalidateQueries({ queryKey: ["quiz-sessions", "my"] });
    },
  });
};
