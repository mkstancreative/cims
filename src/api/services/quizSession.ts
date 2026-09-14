import { api } from "./api";
import type {
  QuizSessionListResponse,
  QuizSessionDetailResponse,
  QuizSessionParams,
  OpenQuizSessionPayload,
  MarkAttendancePayload,
  MarkAttendanceResponse,
  MyQuizSessionResponse,
} from "../types/quizSession";

export const getQuizSessions = async (
  params?: QuizSessionParams,
): Promise<QuizSessionListResponse> => {
  const response = await api.get("/quiz-sessions", { params });
  return response.data;
};

export const getQuizSession = async (
  id: string,
): Promise<QuizSessionDetailResponse> => {
  const response = await api.get(`/quiz-sessions/${id}`);
  return response.data;
};

/**
 * Opens a sitting and seeds the roll from every placed/active student in the
 * batch, all `present: false`.
 */
export const openQuizSession = async (payload: OpenQuizSessionPayload) => {
  const response = await api.post("/quiz-sessions", payload);
  return response.data;
};

/** Bulk — the whole roll in one request, keyed on internship id. */
export const markQuizAttendance = async ({
  id,
  records,
}: MarkAttendancePayload): Promise<MarkAttendanceResponse> => {
  const response = await api.patch(`/quiz-sessions/${id}/attendance`, {
    records,
  });
  return response.data;
};

/** Makes the quiz live for the students marked present, and notifies them. */
export const unlockQuizSession = async (id: string) => {
  const response = await api.patch(`/quiz-sessions/${id}/unlock`);
  return response.data;
};

/** A closed sitting can never be reopened — open a new one instead. */
export const closeQuizSession = async (id: string) => {
  const response = await api.patch(`/quiz-sessions/${id}/close`);
  return response.data;
};

/** Student-facing: their own attendance only, never the roll. */
export const getMyQuizSession = async (): Promise<MyQuizSessionResponse> => {
  const response = await api.get("/quiz-sessions/my");
  return response.data;
};
