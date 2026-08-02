import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import "./NotificationCenter.css";
import { useNotifications } from "../../../context";
import type { Notification } from "../../../api/types/notifications";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from "lucide-react";

function typeIcon(type: string) {
  switch (type) {
    case "success":
      return <CheckCircle size={13} />;
    case "error":
      return <XCircle size={13} />;
    case "warning":
      return <AlertTriangle size={13} />;
    default:
      return <Info size={13} />;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`nc-item ${!notification.isRead ? "nc-item--unread" : ""} nc-item--${notification.type}`}
      onClick={() => !notification.isRead && onMarkRead(notification._id)}
    >
      <div className={`nc-type-icon nc-type-icon--${notification.type}`}>
        {typeIcon(notification.type)}
      </div>

      <div className="nc-item-body">
        <div className="nc-item-title">{notification.title}</div>
        <div className="nc-item-message">{notification.message}</div>
        <div className="nc-item-time">{formatDate(notification.createdAt)}</div>
      </div>

      <div className="nc-item-actions">
        {!notification.isRead && (
          <button
            className="nc-action-btn nc-action-btn--read"
            title="Mark as read"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification._id);
            }}
          >
            <Check size={12} />
          </button>
        )}
        <button
          className="nc-action-btn nc-action-btn--delete"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification._id);
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

export const NotificationCenter: React.FC<{ onClose?: () => void }> = ({
  onClose,
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    isConnected,
  } = useNotifications();

  const { user } = useAuth();
  const rolePrefix =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "student"
        ? "/student"
        : "/supervisor";

  const listRef = useRef<HTMLDivElement>(null);

  // Scroll to top when new notifications arrive
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [notifications.length]);

  return (
    <div className="nc-root">
      {/* ── Header ── */}
      <div className="nc-header">
        <div className="nc-header-left">
          <Bell size={15} />
          <span className="nc-title">Notifications</span>
          {unreadCount > 0 && (
            <span className="nc-unread-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <div className="nc-header-right">
          <span
            className={`nc-ws-dot ${isConnected ? "nc-ws-dot--on" : "nc-ws-dot--off"}`}
            title={isConnected ? "Live" : "Reconnecting…"}
          />
          {unreadCount > 0 && (
            <button
              className="nc-mark-all-btn"
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* ── List ── */}
      <div className="nc-list" ref={listRef}>
        {isLoading && notifications.length === 0 && (
          <div className="nc-loading">
            <span className="nc-spinner" /> Loading…
          </div>
        )}

        {error && notifications.length === 0 && (
          <div className="nc-error">
            <XCircle size={14} /> {error}
          </div>
        )}

        {!isLoading && !error && notifications.length === 0 && (
          <div className="nc-empty">
            <Bell size={28} />
            <p>No notifications yet</p>
          </div>
        )}

        {notifications.slice(0, 5).map((n) => (
          <NotificationItem
            key={n._id}
            notification={n}
            onMarkRead={handleMarkAsRead}
            onDelete={handleDeleteNotification}
          />
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="nc-footer">
        <Link
          to={`${rolePrefix}/notifications`}
          className="nc-view-all"
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};
