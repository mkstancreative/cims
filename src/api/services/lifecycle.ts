import { api } from "./api";
import type { DeleteResponse, StatusResponse } from "../types/lifecycle";

/**
 * `PATCH {base}/:id/status`. Send the TARGET state, never a flip — the call is
 * then idempotent (a double-click or retry lands in the same place).
 */
export const setResourceStatus = async <T>(
  base: string,
  id: string,
  isActive: boolean,
): Promise<StatusResponse<T>> => {
  const response = await api.patch<StatusResponse<T>>(`${base}/${id}/status`, {
    isActive,
  });
  return response.data;
};

/**
 * `DELETE {base}/:id`. With `dryRun` it checks everything and writes nothing,
 * always answering 200. A real delete that's refused answers 409 with the same
 * body — returned here (with `blocked: true`) rather than thrown, so the
 * caller renders one "blocked" view for both. A 404 still throws.
 */
export const deleteResource = async (
  base: string,
  id: string,
  { dryRun = false }: { dryRun?: boolean } = {},
): Promise<DeleteResponse> => {
  try {
    const response = await api.delete<DeleteResponse>(`${base}/${id}`, {
      params: dryRun ? { dryRun: true } : undefined,
    });
    return response.data;
  } catch (err) {
    const res = (err as { response?: { status?: number; data?: DeleteResponse } })
      .response;
    if (res?.status === 409 && res.data?.data) return res.data;
    throw err;
  }
};
