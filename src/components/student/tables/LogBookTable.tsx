import { Eye, Trash2, Pencil } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropDown";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import { useLogBooks } from "../../../hooks/useLogBooks";
import { formatDate } from "../../../helpers/utilities";
import "../LogBookShared.css";
import type {
  LogBookListItem,
  LogBookStatus,
} from "../../../api/types/logbook";

interface LogBookTableProps {
  search?: string;
  status?: LogBookStatus | "";
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onView: (logbook: LogBookListItem) => void;
  onEdit: (logbook: LogBookListItem) => void;
  onDeleteRequest: (logbook: LogBookListItem) => void;
}

// Map status → badge colours matching LogBookShared.css pattern
const STATUS_CLS: Record<string, string> = {
  draft: "lb-status draft",
  submitted: "lb-status submitted",
  approved: "lb-status approved",
  rejected: "lb-status rejected",
  needs_revision: "lb-status needs-revision",
};

export default function LogBookTable({
  search,
  status,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onView,
  onEdit,
  onDeleteRequest,
}: LogBookTableProps) {
  const { data, isLoading } = useLogBooks({
    page,
    limit,
    search,
    status,
  });

  const logbooks: LogBookListItem[] = data?.data ?? [];

  const meta: TableMeta | null = data
    ? {
        page: data.page,
        pages: data.pages,
        count: data.total,
        limit,
        hasPrev: data.page > 1,
        hasNext: data.page < data.pages,
      }
    : null;

  const columns: Column<LogBookListItem>[] = [
    {
      header: "Date",
      render: (row) => (
        <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
          {row.date ? formatDate(row.date) : "—"}
        </span>
      ),
    },
    {
      header: "Notes",
      render: (row) => (
        <span
          style={{
            maxWidth: 260,
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "var(--color-text-secondary)",
            fontSize: 12.5,
          }}
          title={row.notes}
        >
          {row.notes || "—"}
        </span>
      ),
    },
    {
      header: "Hours",
      render: (row) => `${row.hoursSpent} hrs`,
    },
    {
      header: "Status",
      render: (row) => {
        const cls = STATUS_CLS[row.status] ?? "lb-status draft";
        const label = row.status.replace("_", " ");
        return <span className={cls}>{label}</span>;
      },
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: "View Details",
              icon: <Eye size={13} />,
              onClick: () => onView(row),
            },
            {
              label:
                row.status === "needs_revision" ? "Revise Entry" : "Edit Entry",
              icon: <Pencil size={13} />,
              onClick: () => onEdit(row),
              disabled:
                row.status !== "draft" && row.status !== "needs_revision",
            },
            {
              label: "Delete",
              icon: <Trash2 size={13} />,
              onClick: () => onDeleteRequest(row),
              danger: true,
              disabled: row.status === "approved",
            },
          ]}
        />
      ),
    },
  ];

  return (
    <GeneralTable<LogBookListItem>
      columns={columns}
      data={logbooks}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
