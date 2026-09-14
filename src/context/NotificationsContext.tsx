import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Notification } from "../api/types/notifications";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../api/services/notifications";
import {
  NotificationsContext,
  type NotificationsContextType,
} from "./NotificationsContextValue";
import { TOKEN_KEY } from "../api/services/api";

interface NotificationsProviderProps {
  children: React.ReactNode;
}

const NOTIFICATION_POPUP_DURATION = 5000;
const POLL_INTERVAL = 30_000;

// ── Soft chime via Web Audio API (no asset file required) ──────────────────
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();

    const play = (freq: number, startAt: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
      gain.gain.setValueAtTime(0, ctx.currentTime + startAt);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + startAt + 0.01);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + startAt + duration,
      );
      osc.start(ctx.currentTime + startAt);
      osc.stop(ctx.currentTime + startAt + duration);
    };

    play(880, 0, 0.25);   // A5
    play(1108, 0.18, 0.3); // C#6

    // Close the context once the sounds finish to free resources
    setTimeout(() => ctx.close(), 700);
  } catch {
    // AudioContext may be blocked — silently ignore
  }
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [popupNotifications, setPopupNotifications] = useState<Notification[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isConnected, setIsConnected] = useState(false);

  // Track ids we have already seen so polling can surface only genuinely new items.
  const seenIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedOnceRef = useRef(false);

  // ── Dismiss popup ───────────────────────────────────────────────────────────
  const dismissPopup = useCallback((id: string) => {
    setPopupNotifications((prev) => prev.filter((n) => n._id !== id));
  }, []);

  // ── Fetch notifications from REST API ──────────────────────────────────────
  const fetchNotifications = useCallback(
    async (page: number = 1) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getNotifications(page, 10);
        setNotifications(response.data);
        setUnreadCount(response.unreadCount);
        setCurrentPage(response.page);
        setTotalPages(response.pages);
        setIsConnected(true);

        // Surface popups for unread items we haven't seen before (skip first load).
        const freshUnread = response.data.filter(
          (n) => !n.isRead && !seenIdsRef.current.has(n._id),
        );
        response.data.forEach((n) => seenIdsRef.current.add(n._id));

        if (hasLoadedOnceRef.current && freshUnread.length) {
          playNotificationSound();
          setPopupNotifications((prev) => [...freshUnread, ...prev].slice(0, 5));
          freshUnread.forEach((n) =>
            setTimeout(() => dismissPopup(n._id), NOTIFICATION_POPUP_DURATION),
          );
        }
        hasLoadedOnceRef.current = true;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to fetch notifications";
        setError(msg);
        setIsConnected(false);
        console.error("[Notifications] Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [dismissPopup],
  );

  // ── Mark one as read ────────────────────────────────────────────────────────
  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("[Notifications] Mark-as-read error:", err);
    }
  }, []);

  // ── Mark all as read ────────────────────────────────────────────────────────
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("[Notifications] Mark-all-read error:", err);
    }
  }, []);

  // ── Delete notification ─────────────────────────────────────────────────────
  const handleDeleteNotification = useCallback(async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("[Notifications] Delete error:", err);
    }
  }, []);

  // ── Poll while authenticated ────────────────────────────────────────────────
  //
  // This provider polls rather than holding a socket. That happens to satisfy
  // the broadcast rule for free: a batch announcement is delivered as one
  // emit to everyone and so carries no per-recipient `_id`, and the rule is
  // to refetch the list rather than push the payload in — which is exactly
  // what a poll does. If a socket is ever wired up here, an incoming payload
  // without an `_id` must call `fetchNotifications()`, never be appended:
  // a row with no id has nothing for "mark as read" to act on.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return; // Public route — skip

    // Kick off the first fetch asynchronously so the effect body itself does
    // not trigger a synchronous state update.
    const initial = setTimeout(() => fetchNotifications(), 0);
    const timer = setInterval(() => {
      if (localStorage.getItem(TOKEN_KEY)) fetchNotifications();
    }, POLL_INTERVAL);

    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [fetchNotifications]);

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    currentPage,
    totalPages,
    isConnected,
    popupNotifications,
    fetchNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    dismissPopup,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
