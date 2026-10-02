import { api } from "./api";
import type { InternshipScope } from "../types/internship";
import type {
  QuizListResponse,
  QuizResponse,
  CreateQuizPayload,
  UpdateQuizPayload,
  ReorderQuizQuestionsPayload,
  ReorderQuizQuestionsResponse,
  QuizParams,
  MyQuizResponse,
  QuizSummaryResponse,
  SubmitQuizPayload,
  SubmitQuizResult,
} from "../types/quiz";

export const createQuiz = async (payload: CreateQuizPayload) => {
  const response = await api.post("/quizzes", payload);
  return response.data;
};

export const getQuizzes = async (
  params?: QuizParams,
): Promise<QuizListResponse> => {
  const response = await api.get("/quizzes", { params });
  return response.data;
};

export const getQuiz = async (id: string): Promise<QuizResponse> => {
  const response = await api.get<QuizResponse>(`/quizzes/${id}`);
  return response.data;
};

export const updateQuiz = async ({ id, data }: UpdateQuizPayload) => {
  const response = await api.put(`/quizzes/${id}`, data);
  return response.data;
};

export const reorderQuizQuestions = async ({
  id,
  questionIds,
}: ReorderQuizQuestionsPayload): Promise<ReorderQuizQuestionsResponse> => {
  const response = await api.put<ReorderQuizQuestionsResponse>(
    `/quizzes/${id}/questions/reorder`,
    { questionIds },
  );
  return response.data;
};

/** Dashboard overview — no questions ever, so safe to poll and show anywhere. */
export const getMyQuizSummary = async (
  scope?: InternshipScope,
): Promise<QuizSummaryResponse> => {
  const response = await api.get("/quizzes/my/summary", { params: scope });
  return response.data;
};

export const getMyQuiz = async (
  scope?: InternshipScope,
): Promise<MyQuizResponse> => {
  const response = await api.get("/quizzes/my", { params: scope });
  return response.data;
};

/**
 * `token` is the paper's `submitToken` — send it on the AUTOMATIC submit when
 * the timer runs out (it's what lets a just-late submission through). A
 * manual submit before the deadline doesn't need it.
 */
export const submitQuiz = async (
  id: string,
  payload: SubmitQuizPayload,
  token?: string | null,
): Promise<SubmitQuizResult> => {
  const response = await api.post(`/quizzes/${id}/submit`, payload, {
    headers: token ? { "x-quiz-token": token } : undefined,
  });
  return response.data;
};
