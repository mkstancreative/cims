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
  weekNumber?: string;
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
  weekNumber,
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
    weekNumber: weekNumber ? Number(weekNumber) : undefined,
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
      header: "Week #",
      render: (row) => (
        <span style={{ fontWeight: 700 }}>Week {row.weekNumber}</span>
      ),
    },
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Start Date",
      render: (row) =>
        row.weekStartDate ? formatDate(row.weekStartDate) : "—",
    },
    {
      header: "End Date",
      render: (row) => (row.weekEndDate ? formatDate(row.weekEndDate) : "—"),
    },
    {
      header: "Total Hours",
      render: (row) => `${row.totalHours ?? 0} hrs`,
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
              // disabled: row.status === "submitted",
            },
            {
              label:
                row.status === "needs_revision" ? "Revise Log" : "Edit Draft",
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
