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
  UpdateStatusApiResult,
} from "../api/types/student";
import { abandonedNotice } from "../helpers/internship";

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

/** One internship's progress; omit `internshipId` for the current one. */
export const useStudentProgress = (
  id: string,
  internshipId?: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["students", id, "progress", internshipId ?? "current"],
    queryFn: (): Promise<StudentProgressResponse> =>
      getStudentProgress(id, internshipId),
    enabled: !!id && enabled,
    select: (data) => data.data,
    retry: false,
  });
};

export const useUpdateStudentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStudentStatusPayload) =>
      updateStudentStatus(payload),
    onSuccess: (res: UpdateStatusApiResult) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["internships"] });
      toast.success("Student status updated.");
      // Activations close the students' other active internships.
      const notice = abandonedNotice(res?.data?.abandoned);
      if (notice) {
        queryClient.invalidateQueries({ queryKey: ["batches"] });
        toast.info(notice);
      }
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to update student status.")),
  });
};
