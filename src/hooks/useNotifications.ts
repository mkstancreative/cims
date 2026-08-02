import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../api/services/notifications";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const useGetNotifications = (page: number = 1, limit: number = 5) => {
  return useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: () => getNotifications(page, limit),
    retry: 1,
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
