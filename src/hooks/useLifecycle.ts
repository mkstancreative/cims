import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  deleteResource,
  setResourceStatus,
} from "../api/services/lifecycle";
import type {
  DurationStillLive,
  LifecycleResource,
} from "../api/types/lifecycle";
import { isQuizSittingInProgress } from "./useQuizSessions";
import { LIFECYCLE } from "../helpers/lifecycle";

type ApiError = {
  response?: {
    status?: number;
    data?: { message?: string; data?: DurationStillLive };
  };
};

const errMsg = (err: unknown, fallback: string) =>
  (err as ApiError)?.response?.data?.message ?? fallback;

/**
 * Activate / deactivate via `PATCH …/:id/status`. The server's `message`
 * confirms it; a `warning` (downstream impact, or a duration overlap) stays
 * on screen until dismissed.
 */
export const useSetStatus = (resource: LifecycleResource) => {
  const queryClient = useQueryClient();
  const { base, queryKey, noun } = LIFECYCLE[resource];
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setResourceStatus(base, id, isActive),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(res.message);
      if (res.warning) toast.warn(res.warning, { autoClose: false });
    },
    onError: (err: unknown) => {
      const res = (err as ApiError)?.response;
      // Durations only: deactivation refused while the tier is still live.
      if (resource === "duration" && res?.status === 409 && res.data?.data) {
        const { liveBatches, openRegistrations } = res.data.data;
        toast.error(
          `${errMsg(err, "This duration is still in use.")} ` +
            `(${liveBatches} live batch(es), ${openRegistrations} open registration(s)) — archive and close those first.`,
          { autoClose: false },
        );
        return;
      }
      // A quiz can't be deactivated while it's being sat — refresh which
      // quizzes are live so the table disables the control.
      if (isQuizSittingInProgress(err))
        queryClient.invalidateQueries({ queryKey: ["quiz-sessions"] });
      toast.error(errMsg(err, `Couldn't change the ${noun}'s status.`));
    },
  });
};

/**
 * The delete preflight — `DELETE …/:id?dryRun=true`. Runs every check and
 * writes nothing, so it's a query, not a mutation. Always fresh.
 */
export const useDeletePreflight = (
  resource: LifecycleResource,
  id: string | null,
) => {
  const { base } = LIFECYCLE[resource];
  return useQuery({
    // Deliberately NOT under the resource's key: refreshing the list after a
    // status change or delete must not re-run the dry run on an open dialog.
    queryKey: ["lifecycle-preflight", resource, id],
    queryFn: () => deleteResource(base, id!, { dryRun: true }),
    enabled: Boolean(id),
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
};

/**
 * The real, irreversible delete. Resolves with the body on a 409 as well
 * (`data.blocked: true`) — something may have started referencing the record
 * since the preflight — so the caller branches on `data.deleted`.
 */
export const useDeleteResource = (resource: LifecycleResource) => {
  const queryClient = useQueryClient();
  const { base, queryKey, noun } = LIFECYCLE[resource];
  return useMutation({
    mutationFn: (id: string) => deleteResource(base, id),
    onSuccess: (res) => {
      if (res.data.deleted) {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        toast.success(res.message || `The ${noun} was deleted.`);
      }
    },
    onError: (err: unknown) =>
      toast.error(errMsg(err, `Couldn't delete the ${noun}.`)),
  });
};
