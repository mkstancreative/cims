import { api } from "./api";
import type {
  QuizListResponse,
  CreateQuizPayload,
  UpdateQuizPayload,
  QuizParams,
  MyQuizResponse,
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

export const getQuiz = async (id: string) => {
  const response = await api.get(`/quizzes/${id}`);
  return response.data;
};

export const updateQuiz = async ({ id, data }: UpdateQuizPayload) => {
  const response = await api.put(`/quizzes/${id}`, data);
  return response.data;
};

export const deactivateQuiz = async (id: string) => {
  const response = await api.delete(`/quizzes/${id}`);
  return response.data;
};

export const getMyQuiz = async (): Promise<MyQuizResponse> => {
  const response = await api.get("/quizzes/my");
  return response.data;
};

export const submitQuiz = async (
  id: string,
  payload: SubmitQuizPayload,
): Promise<SubmitQuizResult> => {
  const response = await api.post(`/quizzes/${id}/submit`, payload);
  return response.data;
};
