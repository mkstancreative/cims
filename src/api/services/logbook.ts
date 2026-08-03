import { api } from "./api";
import type {
  LogBookListResponse,
  LogBookDetailResponse,
  CreateLogBookEntryPayload,
  LogBookParams,
} from "../types/logbook";

const BASE = "/logbooks";

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getLogBooks = async (
  params?: LogBookParams,
): Promise<LogBookListResponse> => {
  const response = await api.get(BASE, { params });
  return response.data;
};

export const getLogBookById = async (
  id: string,
): Promise<LogBookDetailResponse> => {
  const response = await api.get(`${BASE}/${id}`);
  return response.data;
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const createLogBook = async (
  payload: CreateLogBookEntryPayload,
): Promise<LogBookDetailResponse> => {
  const response = await api.post(BASE, payload);
  return response.data;
};

export const updateLogBook = async (
  id: string,
  payload: CreateLogBookEntryPayload,
): Promise<LogBookDetailResponse> => {
  const response = await api.put(`${BASE}/${id}`, payload);
  return response.data;
};

export const deleteLogBook = async (id: string): Promise<void> => {
  await api.delete(`${BASE}/${id}`);
};

export const submitLogBook = async (
  id: string,
): Promise<LogBookDetailResponse> => {
  const response = await api.put(`${BASE}/${id}/submit`);
  return response.data;
};