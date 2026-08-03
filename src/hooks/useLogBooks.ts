import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getLogBooks,
  getLogBookById,
  createLogBook,
  updateLogBook,
  deleteLogBook,
  submitLogBook,
} from "../api/services/logbook";
import type { CreateLogBookEntryPayload, LogBookParams } from "../api/types/logbook";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const useLogBooks = (params?: LogBookParams) => {
  return useQuery({
    queryKey: ["logbooks", params],
    queryFn: () => getLogBooks(params),
  });
};

export const useLogBookById = (id: string) => {
  return useQuery({
    queryKey: ["logbooks", id],
    queryFn: () => getLogBookById(id),
    enabled: !!id,
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useCreateLogBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLogBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbooks"] });
      toast.success("Log book entry created successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to create log book entry.")),
  });
};

export const useUpdateLogBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateLogBookEntryPayload;
    }) => updateLogBook(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbooks"] });
      toast.success("Log book entry updated successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to update log book entry.")),
  });
};

export const useDeleteLogBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLogBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbooks"] });
      toast.success("Log book entry deleted.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to delete log book entry.")),
  });
};

export const useSubmitLogBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitLogBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbooks"] });
      toast.success("Log book submitted for review!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to submit log book.")),
  });
};

