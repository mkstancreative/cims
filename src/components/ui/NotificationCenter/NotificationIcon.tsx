import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../../../context";
import { NotificationCenter } from "./NotificationCenter";
import "./NotificationIcon.css";

export const NotificationIcon: React.FC = () => {
  const { unreadCount, isConnected } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  return (
    <div className="ni-wrapper" ref={wrapperRef}>
      <button
        id="notification-bell-btn"
        className="ni-btn"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={isOpen}
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span className="ni-badge" aria-hidden>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        <span
          className={`ni-live-dot ${isConnected ? "ni-live-dot--on" : "ni-live-dot--off"}`}
          title={isConnected ? "Live – connected" : "Reconnecting…"}
        />
      </button>

      {isOpen && (
        <div
          className="ni-dropdown"
          role="dialog"
          aria-label="Notification panel"
        >
          <NotificationCenter onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};
