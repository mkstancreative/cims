import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getPublicDurations,
  getDurations,
  createDuration,
  updateDuration,
  deleteDuration,
} from "../api/services/duration";
import type {
  DurationParams,
  DurationInUse,
} from "../api/types/duration";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

/** Reads the in-use counts off a refused (409) deactivation. */
export function durationInUseCounts(err: unknown): DurationInUse | null {
  const e = err as {
    response?: { status?: number; data?: { data?: DurationInUse } };
  };
  if (e?.response?.status !== 409) return null;
  return e.response?.data?.data ?? null;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Public — the registration form's period picker. Active tiers only. */
export const usePublicDurations = () => {
  return useQuery({
    queryKey: ["durations", "public"],
    queryFn: getPublicDurations,
  });
};

export const useDurations = (params?: DurationParams) => {
  return useQuery({
    queryKey: ["durations", params],
    queryFn: () => getDurations(params),
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────
//
// Overlapping week ranges are allowed: create / update answer 200/201 with a
// non-blocking `warning`. Surface it, don't treat it as an error.

export const useCreateDuration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDuration,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["durations"] });
      toast.success("Duration created successfully!");
      if (data.warning) toast.warn(data.warning);
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to create duration.")),
  });
};

export const useUpdateDuration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDuration,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["durations"] });
      toast.success("Duration updated successfully!");
      if (data.warning) toast.warn(data.warning);
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to update duration.")),
  });
};

/**
 * Persists a new display order.
 *
 * There is no bulk reorder endpoint — `sortOrder` is just another updatable
 * field — so this writes one PUT per row that actually moved. It stays
 * pending until the refetched list has landed, so the caller can hold its
 * optimistic order until the server agrees.
 */
export const useReorderDurations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (writes: Array<{ id: string; sortOrder: number }>) => {
      await Promise.all(
        writes.map((w) =>
          updateDuration({ id: w.id, data: { sortOrder: w.sortOrder } }),
        ),
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["durations"] }),
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to save the new order.")),
  });
};

export const useDeleteDuration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDuration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["durations"] });
      toast.success("Duration deactivated.");
    },
    onError: (err: unknown) => {
      // A 409 means the tier is still attached to live batches or open
      // registrations — name the counts so the admin knows what to clear.
      const counts = durationInUseCounts(err);
      if (counts) {
        toast.error(
          `${getErrMsg(err, "This duration is still in use.")} ` +
            `(${counts.liveBatches} live batch(es), ` +
            `${counts.openRegistrations} open registration(s))`,
        );
        return;
      }
      toast.error(getErrMsg(err, "Failed to deactivate duration."));
    },
  });
};
