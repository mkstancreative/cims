import { useState } from "react";
import { Bell, Mail } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import AddButton from "../../components/ui/AddButton/AddButton";
import {
  useGetNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "../../hooks/useNotifications";
import type {
  NotificationType,
  Notification,
} from "../../api/types/notifications";
import NotificationTable from "../../components/admin/tables/NotificationTable";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";

interface Filters {
  page: number;
  limit: number;
  type: NotificationType | "";
  isRead: "true" | "false" | "";
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 10,
    type: "",
    isRead: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);

  // Fetch notifications with filters
  const { data, isLoading } = useGetNotifications(filters.page, filters.limit);
  const notifications = data?.data ?? [];
  const meta = {
    page: data?.page ?? 1,
    pages: data?.pages ?? 1,
    count: data?.total ?? 0,
    limit: filters.limit,
    hasPrev: (data?.page ?? 1) > 1,
    hasNext: (data?.page ?? 1) < (data?.pages ?? 1),
  };

  // Mutations
  const { mutate: markAsRead, isPending: markingAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: markingAllAsRead } =
    useMarkAllAsRead();
  const { mutate: deleteNotification, isPending: deleting } =
    useDeleteNotification();

  // Handlers
  const setField = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      type: "",
      isRead: "",
    });
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDelete = (id: string) => {
    const notif = notifications.find((n) => n._id === id);
    if (notif) {
      setDeleteTarget(notif);
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteNotification(deleteTarget._id, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  };

  // Filter notifications based on UI filters
  const filteredNotifications = notifications.filter((notif) => {
    if (filters.type && notif.type !== filters.type) return false;
    if (filters.isRead === "true" && !notif.isRead) return false;
    if (filters.isRead === "false" && notif.isRead) return false;
    return true;
  });

  return (
    <>
      <div className="page-container">
        {/* ── Header ── */}
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon orange">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="page-title">Notifications</h2>
              <p className="page-sub">
                Manage your notifications and alerts
                {(data?.unreadCount ?? 0) > 0 && (
                  <span style={{ marginLeft: "8px", fontWeight: "600" }}>
                    ({data?.unreadCount} unread)
                  </span>
                )}
              </p>
            </div>
          </div>
          {(data?.unreadCount ?? 0) > 0 && (
            <div className="page-header-right">
              <AddButton
                text={markingAllAsRead ? "Reading…" : "Read All"}
                icon={<Mail size={14} />}
                onClick={handleMarkAllAsRead}
              />
            </div>
          )}
        </div>

        {/* ── Filters ── */}
        <div className="filter-selects-block">
          <SelectFilter
            label="Type"
            options={[
              { value: "", label: "All Types" },
              { value: "info", label: "Info" },
              { value: "success", label: "Success" },
              { value: "warning", label: "Warning" },
              { value: "error", label: "Error" },
            ]}
            value={filters.type}
            onChange={(value) =>
              setField("type", value as NotificationType | "")
            }
            name="type"
          />
          <SelectFilter
            label="Status"
            options={[
              { value: "", label: "All Status" },
              { value: "false", label: "Unread" },
              { value: "true", label: "Read" },
            ]}
            value={filters.isRead}
            onChange={(value) =>
              setField("isRead", value as "true" | "false" | "")
            }
            name="isRead"
          />
          <ResetButton onClick={handleReset} />
        </div>

        {/* ── Table ── */}
        <div className="table-wrapper">
          <NotificationTable
            data={filteredNotifications}
            loading={isLoading}
            meta={meta}
            onPageChange={(p) => setField("page", p)}
            onLimitChange={(l) => setField("limit", l)}
            onMarkAsRead={handleMarkAsRead}
            onDelete={user?.role === "admin" ? handleDelete : undefined}
            markingAsRead={markingAsRead}
            deleting={deleting}
          />
        </div>
      </div>
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        variant="danger"
        title="Delete Notification"
        message={
          deleteTarget
            ? `Are you sure you want to delete the notification "${deleteTarget.title}"?`
            : ""
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isPending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
