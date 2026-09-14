import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendBatchAnnouncement,
  getBatchAnnouncements,
} from "../api/services/notifications";
import type { NotificationParams } from "../api/types/notifications";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const useGetNotifications = (
  page: number = 1,
  limit: number = 5,
  filters: Omit<NotificationParams, "page" | "limit"> = {},
) => {
  return useQuery({
    queryKey: ["notifications", page, limit, filters],
    queryFn: () => getNotifications(page, limit, filters),
    retry: 1,
  });
};

/** Sent history for one batch — one row per send, with a read count. */
export const useBatchAnnouncements = (batchId: string) => {
  return useQuery({
    queryKey: ["notifications", "batch", batchId],
    queryFn: () => getBatchAnnouncements(batchId),
    enabled: !!batchId,
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: (data) => {
      toast.success(data.message || "Marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      const msg = getErrMsg(error, "Failed to mark as read");
      toast.error(msg);
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: (data) => {
      toast.success(data.message || "All marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      const msg = getErrMsg(error, "Failed to mark all as read");
      toast.error(msg);
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: (data) => {
      toast.success(data.message || "Notification deleted");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      const msg = getErrMsg(error, "Failed to delete notification");
      toast.error(msg);
    },
  });
};

export const useSendBatchAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendBatchAnnouncement,
    onSuccess: (data, variables) => {
      toast.success(
        data.message ?? `Announcement sent to ${data.data.recipients} student(s).`,
      );
      queryClient.invalidateQueries({
        queryKey: ["notifications", "batch", variables.id],
      });
    },
    onError: (error) => {
      // 400 here means nobody matched the chosen audience — the API says so.
      toast.error(getErrMsg(error, "Failed to send the announcement"));
    },
  });
};
