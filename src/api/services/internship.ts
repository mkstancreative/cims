import { api } from "./api";
import type {
  InternshipListResponse,
  MyHistoryResponse,
  InternshipParams,
  UpdateInternshipStatusPayload,
} from "../types/internship";

export const getMyHistory = async (): Promise<MyHistoryResponse> => {
  const response = await api.get("/internships/my-history");
  return response.data;
};

export const getMyInternship = async (id: string) => {
  const response = await api.get(`/internships/my-history/${id}`);
  return response.data;
};

export const getInternships = async (
  params?: InternshipParams,
): Promise<InternshipListResponse> => {
  const response = await api.get("/internships", { params });
  return response.data;
};

export const getInternship = async (id: string) => {
  const response = await api.get(`/internships/${id}`);
  return response.data;
};

export const updateInternshipStatus = async ({
  id,
  status,
}: UpdateInternshipStatusPayload) => {
  const response = await api.put(`/internships/${id}/status`, { status });
  return response.data;
};

export const setCurrentInternship = async (id: string) => {
  const response = await api.put(`/internships/${id}/set-current`);
  return response.data;
};
