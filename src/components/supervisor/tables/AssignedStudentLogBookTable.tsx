import { Eye } from "lucide-react";
import { formatDate } from "../../../helpers/utilities";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropDown";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import type {
  LogbookSummary,
  LogbookStatus,
} from "../../../api/types/schoolSupervisor";

// ─── Status pill ─────────────────────────────────────────────────────

const STATUS_META: Record<LogbookStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "lbt-status--draft" },
  submitted: { label: "Submitted", cls: "lbt-status--submitted" },
  approved: { label: "Approved", cls: "lbt-status--approved" },
  rejected: { label: "Rejected", cls: "lbt-status--rejected" },
  needs_revision: { label: "Needs Revision", cls: "lbt-status--revision" },
};

function StatusPill({ status }: { status: LogbookStatus }) {
  const meta = STATUS_META[status] ?? {
    label: status,
    cls: "lbt-status--draft",
  };
  return <span className={`lbt-status-pill ${meta.cls}`}>{meta.label}</span>;
}

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
      render: (row) => <StatusPill status={row.status} />,
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
        .lbt-hours{font-size:13px;font-weight:600;color:#6366f1}
        .lbt-status-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:600;text-transform:capitalize}
        .lbt-status-pill::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0}
        .lbt-status--draft{background:rgba(99,102,241,.12);color:#818cf8}
        .lbt-status--submitted{background:rgba(251,191,36,.12);color:#fbbf24}
        .lbt-status--approved{background:rgba(99,102,241,.12);color:#6366f1}
        .lbt-status--rejected{background:rgba(239,68,68,.12);color:#ef4444}
        .lbt-status--revision{background:rgba(234,88,12,.12);color:#ea580c}
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
