import { api } from "./api";
import type {
  StudentDetailResponse,
  StudentsResponse,
  LogbookListResponse,
  LogbookDetailResponse,
  ReviewPayload,
} from "../types/schoolSupervisor";

export const supervisorDashboardStats = async () => {
  const response = await api.get("/supervisors/dashboard");
  return response.data;
};

export const getAssignedStudents = async (
  params?: Partial<Pick<StudentsResponse, "page" | "total">>,
): Promise<StudentsResponse> => {
  const response = await api.get("/supervisors/school/students", { params });
  return response.data;
};

export const getStudentDetail = async (
  id: string,
): Promise<StudentDetailResponse> => {
  const response = await api.get(`/supervisors/school/students/${id}`);
  return response.data;
};

export interface LogbookListParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getStudentLogbooks = async (
  studentId: string,
  params?: LogbookListParams,
): Promise<LogbookListResponse> => {
  const response = await api.get(
    `/supervisors/school/students/${studentId}/logbooks`,
    { params },
  );
  return response.data;
};

export const getLogbookDetail = async (
  studentId: string,
  logbookId: string,
): Promise<LogbookDetailResponse> => {
  const response = await api.get(
    `/supervisors/school/students/${studentId}/logbooks/${logbookId}`,
  );
  return response.data;
};

export const reviewLogbook = async (
  logbookId: string,
  payload: ReviewPayload,
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.put(
    `/supervisors/school/logbooks/${logbookId}/review`,
    payload,
  );
  return response.data;
};
