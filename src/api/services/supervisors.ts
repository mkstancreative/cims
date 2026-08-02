import { api } from "./api";
import type {
  SupervisorListResponse,
  SupervisorParams,
  CreateSupervisorPayload,
} from "../types/supervisor";

export const createSupervisor = async (payload: CreateSupervisorPayload) => {
  const response = await api.post("/admin/supervisors", payload);
  return response.data;
};

export const getSupervisors = async (
  params?: SupervisorParams,
): Promise<SupervisorListResponse> => {
  const response = await api.get("/admin/supervisors", { params });
  return response.data;
};
