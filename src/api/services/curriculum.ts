import { api } from "./api";
import type {
  CurriculumListResponse,
  CreateCurriculumPayload,
  UpdateCurriculumPayload,
  CurriculumParams,
  CurriculumDetailResponse,
  MyCurriculumResponse,
} from "../types/curriculum";

export const createCurriculum = async (payload: CreateCurriculumPayload) => {
  const response = await api.post("/curriculum", payload);
  return response.data;
};

export const getCurricula = async (
  params?: CurriculumParams,
): Promise<CurriculumListResponse> => {
  const response = await api.get("/curriculum", { params });
  return response.data;
};

export const getCurriculum = async (
  id: string,
): Promise<CurriculumDetailResponse> => {
  const response = await api.get(`/curriculum/${id}`);
  return response.data;
};

export const updateCurriculum = async ({
  id,
  data,
}: UpdateCurriculumPayload) => {
  const response = await api.put(`/curriculum/${id}`, data);
  return response.data;
};

export const deactivateCurriculum = async (id: string) => {
  const response = await api.delete(`/curriculum/${id}`);
  return response.data;
};

export const getMyCurriculum = async (): Promise<MyCurriculumResponse> => {
  const response = await api.get("/curriculum/my");
  return response.data;
};
