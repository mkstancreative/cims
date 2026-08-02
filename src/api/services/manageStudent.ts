import { api } from "./api";
import type {
  StudentListResponse,
  StudentDetailResponse,
  StudentParams,
  UpdateStudentStatusPayload,
  UpdateStatusApiResult,
} from "../types/student";

export const getStudents = async (
  params?: StudentParams,
): Promise<StudentListResponse> => {
  const response = await api.get("/admin/students", { params });
  return response.data;
};

export const getStudentById = async (
  id: string,
): Promise<StudentDetailResponse> => {
  const response = await api.get(`/admin/students/${id}`);
  return response.data;
};

export const getStudentProgress = async (id: string) => {
  const response = await api.get(`/admin/students/${id}/progress`);
  return response.data;
};

export const updateStudentStatus = async (
  payload: UpdateStudentStatusPayload,
): Promise<UpdateStatusApiResult> => {
  const response = await api.put("/admin/students/status", payload);
  return response.data;
};

export const getUnassignedStudents = async (
  params?: StudentParams,
): Promise<StudentListResponse> => {
  const response = await api.get("/admin/students/unassigned", { params });
  return response.data;
};
