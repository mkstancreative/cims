import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getStudents,
  getStudentById,
  getStudentProgress,
  updateStudentStatus,
  getUnassignedStudents,
} from "../api/services/manageStudent";
import type {
  StudentParams,
  UpdateStudentStatusPayload,
  StudentProgressResponse,
} from "../api/types/student";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

export const useStudents = (params?: StudentParams) => {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () => getStudents(params),
  });
};

export const useUnassignedStudents = (params?: StudentParams) => {
  return useQuery({
    queryKey: ["students", "unassigned", params],
    queryFn: () => getUnassignedStudents(params),
  });
};

export const useStudentById = (id: string) => {
  return useQuery({
    queryKey: ["students", id],
    queryFn: () => getStudentById(id),
    enabled: !!id,
    select: (data) => data.data,
  });
};

export const useStudentProgress = (id: string) => {
  return useQuery({
    queryKey: ["students", id, "progress"],
    queryFn: (): Promise<StudentProgressResponse> => getStudentProgress(id),
    enabled: !!id,
    select: (data) => data.data,
  });
};

export const useUpdateStudentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStudentStatusPayload) =>
      updateStudentStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student status updated.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to update student status.")),
  });
};
