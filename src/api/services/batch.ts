import { api } from "./api";
import type {
  BatchListResponse,
  BatchPayload,
  BatchParams,
  ActivateBatchParams,
  UpdateBatchPayload,
  AssignBatchSupervisorPayload,
  LinkBatchCurriculumPayload,
  ReorderBatchCurriculaPayload,
  AssignBatchQuizPayload,
  DepartmentsResponse,
} from "../types/batch";

export const getBatches = async (
  params?: BatchParams,
): Promise<BatchListResponse> => {
  const response = await api.get("/batches", { params });
  return response.data;
};

export const getMyBatches = async () => {
  const response = await api.get("/batches/supervisor");
  return response.data;
};

export const getBatchById = async (id: string) => {
  const response = await api.get(`/batches/${id}`);
  return response.data;
};

export const getBatchStudents = async (
  id: string,
  params?: { page?: number; limit?: number },
) => {
  const response = await api.get(`/batches/${id}/students`, { params });
  return response.data;
};

export const getBatchStats = async (id: string) => {
  const response = await api.get(`/batches/${id}/stats`);
  return response.data;
};

export const createBatch = async (payload: BatchPayload) => {
  const response = await api.post("/batches", payload);
  return response.data;
};

export const updateBatch = async ({ id, data }: UpdateBatchPayload) => {
  const response = await api.put(`/batches/${id}`, data);
  return response.data;
};

export const deleteBatch = async (id: string) => {
  const response = await api.delete(`/batches/${id}`);
  return response.data;
};

export const activateBatch = async ({
  id,
  activateStudents = true,
}: ActivateBatchParams) => {
  const response = await api.patch(`/batches/${id}/activate`, null, {
    params: { activateStudents },
  });
  return response.data;
};

export const archiveBatch = async (id: string) => {
  const response = await api.patch(`/batches/${id}/archive`);
  return response.data;
};

// ─── Supervisor assignment ────────────────────────────────────────────────────
export const assignBatchSupervisor = async ({
  id,
  supervisorId,
}: AssignBatchSupervisorPayload) => {
  const response = await api.put(`/batches/${id}/supervisor`, { supervisorId });
  return response.data;
};

export const unassignBatchSupervisor = async (id: string) => {
  const response = await api.delete(`/batches/${id}/supervisor`);
  return response.data;
};

// ─── Curriculum linking ───────────────────────────────────────────────────────
export const linkBatchCurriculum = async ({
  id,
  curriculumId,
}: LinkBatchCurriculumPayload) => {
  const response = await api.post(`/batches/${id}/curriculum`, { curriculumId });
  return response.data;
};

export const reorderBatchCurricula = async ({
  id,
  curriculumIds,
}: ReorderBatchCurriculaPayload) => {
  const response = await api.put(`/batches/${id}/curriculum/reorder`, {
    curriculumIds,
  });
  return response.data;
};

export const unlinkBatchCurriculum = async (
  id: string,
  curriculumId: string,
) => {
  const response = await api.delete(
    `/batches/${id}/curriculum/${curriculumId}`,
  );
  return response.data;
};

// ─── Quiz assignment ──────────────────────────────────────────────────────────
export const assignBatchQuiz = async ({ id, quizId }: AssignBatchQuizPayload) => {
  const response = await api.put(`/batches/${id}/quiz`, { quizId });
  return response.data;
};

export const unassignBatchQuiz = async (id: string) => {
  const response = await api.delete(`/batches/${id}/quiz`);
  return response.data;
};

// ─── Departments (admin) ──────────────────────────────────────────────────────
export const getDepartments = async (): Promise<DepartmentsResponse> => {
  const response = await api.get(`/admin/all-departments`);
  return response.data;
};
