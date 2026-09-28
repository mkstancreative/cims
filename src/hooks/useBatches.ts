import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
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
import type { Batch, BatchParams } from "../api/types/batch";
import { abandonedNotice } from "../helpers/internship";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * `enabled` lets a caller that serves both admins and supervisors mount both
 * this and `useMyBatches` and only run the one the role can actually call —
 * `/batches` answers 403 for a supervisor.
 */
export const useBatches = (params?: BatchParams, enabled = true) => {
  return useQuery({
    queryKey: ["batches", params],
    queryFn: () => getBatches(params),
    enabled,
  });
};

export const useMyBatches = (enabled = true) => {
  return useQuery({
    queryKey: ["batches", "supervisor"],
    queryFn: getMyBatches,
    enabled,
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success(data?.message ?? "Batch created successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to create batch.")),
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBatch,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      // The message names how many enrolled students were re-synced when the
      // period moved — that count is the point, so don't replace it.
      toast.success(data?.message ?? "Batch updated successfully!");
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["internships"] });
      toast.success(data?.message ?? "Batch activated successfully!");

      // Students outside their IT period are skipped rather than activated.
      // Without this the admin sees "8 of 12" with no explanation.
      const skipped = data?.data?.skippedOutsidePeriod ?? 0;
      if (skipped > 0) {
        toast.info(
          `${data.data.newlyActivated} student(s) activated. ${skipped} were skipped — they are outside their IT period.`,
        );
      }

      // Activating students closes their earlier cycles in other batches.
      const notice = abandonedNotice(data?.data?.abandoned);
      if (notice) {
        queryClient.invalidateQueries({ queryKey: ["students"] });
        toast.info(notice);
      }
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
    onSuccess: (_res, { id, quizId }) => {
      patchBatchQuizInCache(queryClient, [id], quizId);
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Quiz assigned to batch.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to assign quiz.")),
  });
};

/**
 * Writes a batch's new quiz straight into every cached batch list, so the
 * table and any open dialog show it at once instead of after the refetch.
 * `quizId: null` = unassigned (the API then omits the field).
 */
function patchBatchQuizInCache(
  queryClient: QueryClient,
  batchIds: string[],
  quizId: string | null,
) {
  const ids = new Set(batchIds);
  queryClient.setQueriesData<{ data?: unknown }>(
    { queryKey: ["batches"] },
    (old) => {
      if (!old || !Array.isArray(old.data)) return old; // lists only
      return {
        ...old,
        data: (old.data as Batch[]).map((b) =>
          ids.has(b._id) ? { ...b, quiz: quizId } : b,
        ),
      };
    },
  );
}

export const useUnassignBatchQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unassignBatchQuiz,
    onSuccess: (_res, id: string) => {
      patchBatchQuizInCache(queryClient, [id], null);
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
