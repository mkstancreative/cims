import { api } from "./api";
import type {
  Notification,
  NotificationParams,
  BatchAnnouncementPayload,
  BatchAnnouncementResponse,
  BatchAnnouncementListResponse,
} from "../types/notifications";

export interface NotificationResponse {
  success: boolean;
  total: number;
  unreadCount: number;
  page: number;
  pages: number;
  data: Notification[];
}

export interface NotificationMessage {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export const getNotifications = async (
  page: number = 1,
  limit: number = 5,
  filters: Omit<NotificationParams, "page" | "limit"> = {},
) => {
  const response = await api.get<NotificationResponse>("/notifications", {
    params: {
      page,
      limit,
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.isRead !== undefined ? { isRead: filters.isRead } : {}),
    },
  });
  return response.data;
};

export const markAsRead = async (id: string) => {
  const response = await api.put<NotificationMessage>(
    `/notifications/${id}/read`
  );
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.put<NotificationMessage>(
    `/notifications/read-all`
  );
  return response.data;
};

export const deleteNotification = async (id: string) => {
  const response = await api.delete<NotificationMessage>(
    `/notifications/${id}`
  );
  return response.data;
};

// ─── Batch announcements ──────────────────────────────────────────────────────
// Admin / coordinator only. Supervisors run attendance, but announcements are
// an admin act.

export const sendBatchAnnouncement = async ({
  id,
  data,
}: BatchAnnouncementPayload): Promise<BatchAnnouncementResponse> => {
  const response = await api.post(`/batches/${id}/notifications`, data);
  return response.data;
};

/** Sent history — one row per send, with a read count. */
export const getBatchAnnouncements = async (
  id: string,
): Promise<BatchAnnouncementListResponse> => {
  const response = await api.get(`/batches/${id}/notifications`);
  return response.data;
};
