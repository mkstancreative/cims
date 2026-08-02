import React from "react";
import "./NotificationPopup.css";
import type { Notification } from "../../../api/types/notifications";
import { Info, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";

interface NotificationPopupProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

function typeIcon(type: string) {
  switch (type) {
    case "success":
      return <CheckCircle size={15} />;
    case "error":
      return <XCircle size={15} />;
    case "warning":
      return <AlertTriangle size={15} />;
    default:
      return <Info size={15} />;
  }
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({
  notification,
  onDismiss,
}) => {
  return (
    <div
      className={`np-root np-root--${notification.type}`}
      role="alert"
      aria-live="polite"
    >
      <div className={`np-icon np-icon--${notification.type}`}>
        {typeIcon(notification.type)}
      </div>

      <div className="np-body">
        <div className="np-title">{notification.title}</div>
        <div className="np-message">{notification.message}</div>
      </div>

      <button
        className="np-close"
        onClick={() => onDismiss(notification._id)}
        aria-label="Dismiss notification"
      >
        <X size={13} />
      </button>

      {/* Progress bar */}
      <div className="np-progress" />
    </div>
  );
};
