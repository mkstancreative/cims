import { api } from "./api";
import type {
  InstitutionListResponse,
  PublicInstitutionListResponse,
  CreateInstitutionPayload,
  UpdateInstitutionPayload,
  ToggleInstitutionStatusPayload,
  InstitutionParams,
} from "../types/institution";

export const createInstitution = async (payload: CreateInstitutionPayload) => {
  const response = await api.post("/admin/institutions", payload);
  return response.data;
};

export const getInstitutions = async (
  params?: InstitutionParams,
): Promise<InstitutionListResponse> => {
  const response = await api.get("/admin/institutions", { params });
  return response.data;
};

export const updateInstitution = async ({
  id,
  data,
}: UpdateInstitutionPayload) => {
  const response = await api.put(`/admin/institutions/${id}`, data);
  return response.data;
};

export const toggleInstitutionStatus = async ({
  id,
  isActive,
}: ToggleInstitutionStatusPayload) => {
  const response = await api.put(`/admin/institutions/${id}`, { isActive });
  return response.data;
};

// Public (unauthenticated) — used by the registration form
export const getPublicInstitutions =
  async (): Promise<PublicInstitutionListResponse> => {
    const response = await api.get("/general/institutions");
    return response.data;
  };
