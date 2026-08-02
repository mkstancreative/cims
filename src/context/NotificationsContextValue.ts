import { createContext } from "react";
import type { Notification } from "../api/types/notifications";

export interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  isConnected: boolean;
  popupNotifications: Notification[];

  // Fetching
  fetchNotifications: (page?: number) => Promise<void>;

  // Mutations
  handleMarkAsRead: (id: string) => Promise<void>;
  handleMarkAllAsRead: () => Promise<void>;
  handleDeleteNotification: (id: string) => Promise<void>;

  // Popup management
  dismissPopup: (id: string) => void;
}

export const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);
