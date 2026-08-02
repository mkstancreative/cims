import React from "react";
import { NotificationPopup } from "./NotificationPopup";
import "./NotificationPopupContainer.css";
import { useNotifications } from "../../../context/useNotifications";

export const NotificationPopupContainer: React.FC = () => {
  const { popupNotifications, dismissPopup } = useNotifications();

  if (popupNotifications.length === 0) return null;

  return (
    <div
      className="npc-root"
      aria-live="polite"
      aria-label="Notification popups"
    >
      {popupNotifications.map((notification) => (
        <NotificationPopup
          key={notification._id}
          notification={notification}
          onDismiss={dismissPopup}
        />
      ))}
    </div>
  );
};
