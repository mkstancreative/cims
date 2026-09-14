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
  ActivateBatchResponse,
  BatchMutationResponse,
  BatchDetailResponse,
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

export const getBatchById = async (
  id: string,
): Promise<BatchDetailResponse> => {
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

/** 201 now returns the created batch, not just a message. */
export const createBatch = async (
  payload: BatchPayload,
): Promise<BatchMutationResponse> => {
  const response = await api.post("/batches", payload);
  return response.data;
};

/**
 * Changing `durationId`, `weeks` or `itPeriod.startDate` recomputes the end
 * date and re-syncs every non-completed internship in the batch — the message
 * says how many students moved.
 */
export const updateBatch = async ({
  id,
  data,
}: UpdateBatchPayload): Promise<BatchMutationResponse> => {
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
}: ActivateBatchParams): Promise<ActivateBatchResponse> => {
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
/**
 * `order` means "insert at this position", so the response comes back sorted,
 * unique and gap-free — it is safe to render straight from `data.curricula`.
 */
export const linkBatchCurriculum = async ({
  id,
  curriculumId,
  order,
}: LinkBatchCurriculumPayload) => {
  const response = await api.post(`/batches/${id}/curriculum`, {
    curriculumId,
    ...(order !== undefined ? { order } : {}),
  });
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
