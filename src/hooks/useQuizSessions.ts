import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getQuizSessions,
  getQuizSession,
  openQuizSession,
  markQuizAttendance,
  unlockQuizSession,
  closeQuizSession,
  getMyQuizSession,
} from "../api/services/quizSession";
import type { QuizSessionParams } from "../api/types/quizSession";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

/**
 * A 409 on open means a sitting is already live for that batch; the body
 * carries its id so the caller can navigate straight to it.
 */
export function liveSessionId(err: unknown): string | null {
  const e = err as {
    response?: { status?: number; data?: { data?: { sessionId?: string } } };
  };
  if (e?.response?.status !== 409) return null;
  return e.response?.data?.data?.sessionId ?? null;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const useQuizSessions = (params?: QuizSessionParams) => {
  return useQuery({
    queryKey: ["quiz-sessions", params],
    queryFn: () => getQuizSessions(params),
  });
};

export const useQuizSession = (id: string) => {
  return useQuery({
    queryKey: ["quiz-sessions", id],
    queryFn: () => getQuizSession(id),
    enabled: !!id,
  });
};

/** The student's own attendance for the current sitting, if any. */
export const useMyQuizSession = () => {
  return useQuery({
    queryKey: ["quiz-sessions", "my"],
    queryFn: getMyQuizSession,
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useOpenQuizSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: openQuizSession,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-sessions"] });
      toast.success(data?.message ?? "Sitting opened.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to open the sitting.")),
  });
};

export const useMarkQuizAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markQuizAttendance,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-sessions"] });
      toast.success(data?.message ?? "Attendance saved.");

      // Students enrolled after the sitting opened are added to the roll, and
      // ids that aren't in this batch come back rather than failing the call —
      // both are worth saying out loud.
      const added = data?.data?.addedToRoll?.length ?? 0;
      if (added) {
        toast.info(
          `${added} student(s) enrolled after this sitting opened and were added to the roll.`,
        );
      }
      const stray = data?.data?.notInThisBatch?.length ?? 0;
      if (stray) {
        toast.warn(`${stray} record(s) did not belong to this batch and were ignored.`);
      }
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to save attendance.")),
  });
};

export const useUnlockQuizSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unlockQuizSession,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-sessions"] });
      toast.success(data?.message ?? "Quiz unlocked for the students present.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to unlock the quiz.")),
  });
};

export const useCloseQuizSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: closeQuizSession,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-sessions"] });
      toast.success(data?.message ?? "Sitting closed.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to close the sitting.")),
  });
};
