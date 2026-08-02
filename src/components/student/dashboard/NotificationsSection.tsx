import React from "react";
import { Bell } from "lucide-react";
import { SectionHead } from "../../shared/dashboard/DashboardKit";
import type { StudentDashNotifications } from "../../../api/types/dashboard";

interface NotificationsSectionProps {
  notifications: StudentDashNotifications;
  ago: (d: string) => string;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  notifications,
  ago,
}) => {
  if (notifications.latest.length === 0) return null;

  return (
    <div>
      <SectionHead
        title="Recent Notifications"
        sub={`${notifications.unreadCount} unread`}
        icon={<Bell size={16} />}
        color="rose"
      />
      <div className="db-notif-list" style={{ marginTop: 14 }}>
        {notifications.latest.map((n) => (
          <div className="db-notif-item" key={n._id}>
            <div
              className="db-notif-dot"
              style={{
                background: n.isRead ? "var(--color-text-subtle)" : "#f43f5e",
              }}
            />
            <div style={{ flex: 1 }}>
              <div className="db-notif-title">{n.title}</div>
              <div className="db-notif-msg">{n.message}</div>
            </div>
            <div className="db-notif-time">{ago(n.createdAt)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
