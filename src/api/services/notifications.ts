import { api } from "./api";
import type { Notification } from "../types/notifications";

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

export const getNotifications = async (page: number = 1, limit: number = 5) => {
  const response = await api.get<NotificationResponse>("/notifications", {
    params: { page, limit },
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
