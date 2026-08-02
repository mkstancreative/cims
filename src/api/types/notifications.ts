export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  userId?: string;
}
