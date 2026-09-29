import { Eye } from "lucide-react";
import { formatDate } from "../../../helpers/utilities";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropDown";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import type { LogbookSummary } from "../../../api/types/schoolSupervisor";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";

// ─── Props ────────────────────────────────────────────────────────────

interface AssignedStudentLogBookTableProps {
  data: LogbookSummary[];
  isLoading: boolean;
  meta: TableMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onView: (logbook: LogbookSummary) => void;
}

// ─── Component ────────────────────────────────────────────────────────

export default function AssignedStudentLogBookTable({
  data,
  isLoading,
  meta,
  onPageChange,
  onLimitChange,
  onView,
}: AssignedStudentLogBookTableProps) {
  const columns: Column<LogbookSummary>[] = [
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
            maxWidth: 280,
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
      render: (row) => <span className="lbt-hours">{row.hoursSpent} hrs</span>,
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: "View & Review",
              icon: <Eye size={13} />,
              onClick: () => onView(row),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <style>{`
        .lbt-hours{font-size:13px;font-weight:600;color:var(--color-primary)}
      `}</style>
      <GeneralTable<LogbookSummary>
        columns={columns}
        data={data}
        loading={isLoading}
        meta={meta}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </>
  );
}
