import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getBatches,
  getMyBatches,
  getBatchById,
  getBatchStats,
  getBatchStudents,
  createBatch,
  updateBatch,
  deleteBatch,
  activateBatch,
  archiveBatch,
  assignBatchSupervisor,
  unassignBatchSupervisor,
  linkBatchCurriculum,
  unlinkBatchCurriculum,
  reorderBatchCurricula,
  assignBatchQuiz,
  unassignBatchQuiz,
  getDepartments,
} from "../api/services/batch";
import type { BatchParams } from "../api/types/batch";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const useBatches = (params?: BatchParams) => {
  return useQuery({
    queryKey: ["batches", params],
    queryFn: () => getBatches(params),
  });
};

export const useMyBatches = () => {
  return useQuery({
    queryKey: ["batches", "supervisor"],
    queryFn: getMyBatches,
  });
};

export const useBatchById = (id: string) => {
  return useQuery({
    queryKey: ["batches", id],
    queryFn: () => getBatchById(id),
    enabled: !!id,
  });
};

export const useBatchStudents = (id: string) => {
  return useQuery({
    queryKey: ["batches", id, "students"],
    queryFn: () => getBatchStudents(id),
    enabled: !!id,
  });
};

export const useBatchStats = (id: string) => {
  return useQuery({
    queryKey: ["batches", id, "stats"],
    queryFn: () => getBatchStats(id),
    enabled: !!id,
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch created successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to create batch.")),
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch updated successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to update batch.")),
  });
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch deleted.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to delete batch.")),
  });
};

export const useActivateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch activated successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to activate batch.")),
  });
};

export const useArchiveBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch archived.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to archive batch.")),
  });
};

// ─── Supervisor assignment ────────────────────────────────────────────────────
export const useAssignBatchSupervisor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignBatchSupervisor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Supervisor assigned to batch.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to assign supervisor.")),
  });
};

export const useUnassignBatchSupervisor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unassignBatchSupervisor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Supervisor unassigned.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to unassign supervisor.")),
  });
};

// ─── Curriculum linking ───────────────────────────────────────────────────────
export const useLinkBatchCurriculum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: linkBatchCurriculum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Curriculum linked to batch.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to link curriculum.")),
  });
};

export const useUnlinkBatchCurriculum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, curriculumId }: { id: string; curriculumId: string }) =>
      unlinkBatchCurriculum(id, curriculumId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Curriculum unlinked.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to unlink curriculum.")),
  });
};

export const useReorderBatchCurricula = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderBatchCurricula,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to reorder curricula.")),
  });
};

// ─── Quiz assignment ──────────────────────────────────────────────────────────
export const useAssignBatchQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignBatchQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Quiz assigned to batch.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to assign quiz.")),
  });
};

export const useUnassignBatchQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unassignBatchQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Quiz unassigned.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to unassign quiz.")),
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });
};
