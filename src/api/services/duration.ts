import { api } from "./api";
import type {
  PublicDurationListResponse,
  DurationListResponse,
  DurationParams,
  CreateDurationPayload,
  UpdateDurationPayload,
  DurationMutationResponse,
} from "../types/duration";

/**
 * Public — feeds the period picker on the registration form. Active
 * durations only, no auth required.
 */
export const getPublicDurations =
  async (): Promise<PublicDurationListResponse> => {
    const response = await api.get("/general/durations");
    return response.data;
  };

export const getDurations = async (
  params?: DurationParams,
): Promise<DurationListResponse> => {
  const response = await api.get("/admin/durations", { params });
  return response.data;
};

export const createDuration = async (
  payload: CreateDurationPayload,
): Promise<DurationMutationResponse> => {
  const response = await api.post("/admin/durations", payload);
  return response.data;
};

export const updateDuration = async ({
  id,
  data,
}: UpdateDurationPayload): Promise<DurationMutationResponse> => {
  const response = await api.put(`/admin/durations/${id}`, data);
  return response.data;
};

