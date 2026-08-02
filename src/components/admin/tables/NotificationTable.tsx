import { Mail, Trash2 } from "lucide-react";
import ActionDropdown, {
  type Action,
} from "../../ui/ActionDropdown/ActionDropDown";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Notification } from "../../../api/types/notifications";

import type { TableMeta } from "../../ui/GeneralTable/GeneralTable";
import { formatDateTime } from "../../../helpers/utilities";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";

interface NotificationTableProps {
  data: Notification[];
  loading: boolean;
  meta: TableMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
  markingAsRead: boolean;
  deleting: boolean;
}

export default function NotificationTable({
  data,
  loading,
  meta,
  onPageChange,
  onLimitChange,
  onMarkAsRead,
  onDelete,
  markingAsRead,
  deleting,
}: NotificationTableProps) {
  // Table columns
  const columns = [
    {
      header: "Type",
      render: (n: Notification) => (
        <span
          className={`notif-type-badge notif-type-${n.type}`}
          style={{
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "capitalize",
            backgroundColor:
              {
                info: "#dbeafe",
                success: "#dcfce7",
                warning: "#fef3c7",
                error: "#fee2e2",
              }[n.type] || "#f3f4f6",
            color:
              {
                info: "#0369a1",
                success: "#15803d",
                warning: "#b45309",
                error: "#b91c1c",
              }[n.type] || "#374151",
          }}
        >
          {n.type}
        </span>
      ),
    },
    {
      header: "Title",
      render: (n: Notification) => (
        <div style={{ fontWeight: n.isRead ? "400" : "600" }}>{n.title}</div>
      ),
    },
    {
      header: "Message",
      render: (n: Notification) => (
        <div style={{ fontSize: "14px", color: "#6b7280" }}>{n.message}</div>
      ),
    },
    {
      header: "Status",
      render: (n: Notification) => (
        <StatusBadge status={n.isRead ? "read" : "unread"} />
      ),
    },
    {
      header: "Date",
      render: (n: Notification) => formatDateTime(n.createdAt),
    },
    {
      header: "Actions",
      render: (n: Notification) => {
        const actions: Action[] = [
          {
            label: n.isRead ? "Mark as Unread" : "Mark as Read",
            icon: <Mail size={13} />,
            onClick: () => onMarkAsRead(n._id),
            disabled: markingAsRead,
          },
        ];

        if (onDelete) {
          actions.push({
            label: "Delete",
            icon: <Trash2 size={13} />,
            onClick: () => onDelete(n._id),
            danger: true,
            disabled: deleting,
          });
        }

        return <ActionDropdown actions={actions} />;
      },
    },
  ];

  return (
    <GeneralTable
      columns={columns}
      data={data}
      loading={loading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
