import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAssignedStudents,
  getStudentDetail,
  getStudentLogbooks,
  getLogbookDetail,
  reviewLogbook,
  type LogbookListParams,
} from "../api/services/schoolSupervisors";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

// ─── Query Keys ───────────────────────────────────────────

export const supervisorQueryKeys = {
  all: ["school-supervisor"] as const,

  students: (params?: { page?: number }) =>
    [...supervisorQueryKeys.all, "students", params] as const,

  studentDetail: (id: string) =>
    [...supervisorQueryKeys.all, "student", id] as const,

  logbooks: (studentId: string, params?: LogbookListParams) =>
    [...supervisorQueryKeys.all, "logbooks", studentId, params] as const,

  logbookDetail: (studentId: string, logbookId: string) =>
    [...supervisorQueryKeys.all, "logbook", studentId, logbookId] as const,
};

// ─── Hooks ────────────────────────────────────────────────

export const useAssignedStudents = (params?: {
  page?: number;
  total?: number;
}) => {
  return useQuery({
    queryKey: supervisorQueryKeys.students(params),
    queryFn: () => getAssignedStudents(params),
  });
};

export const useStudentDetail = (id: string) => {
  return useQuery({
    queryKey: supervisorQueryKeys.studentDetail(id),
    queryFn: () => getStudentDetail(id),
    enabled: !!id,
  });
};

export const useStudentLogbooks = (
  studentId: string,
  params?: LogbookListParams,
) => {
  return useQuery({
    queryKey: supervisorQueryKeys.logbooks(studentId, params),
    queryFn: () => getStudentLogbooks(studentId, params),
    enabled: !!studentId,
  });
};

export const useLogbookDetail = (studentId: string, logbookId: string) => {
  return useQuery({
    queryKey: supervisorQueryKeys.logbookDetail(studentId, logbookId),
    queryFn: () => getLogbookDetail(studentId, logbookId),
    enabled: !!studentId && !!logbookId,
  });
};

export const useReviewLogbook = (studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      logbookId,
      comments,
    }: {
      logbookId: string;
      comments: string;
    }) => reviewLogbook(logbookId, { comments }),
    onSuccess: (_data, { logbookId }) => {
      queryClient.invalidateQueries({
        queryKey: supervisorQueryKeys.logbooks(studentId),
      });
      queryClient.invalidateQueries({
        queryKey: supervisorQueryKeys.logbookDetail(studentId, logbookId),
      });
      toast.success("Review submitted successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to submit review.")),
  });
};
