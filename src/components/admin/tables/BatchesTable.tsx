import {
  Edit2,
  Zap,
  Archive,
  Trash2,
  UserPlus,
  BookOpen,
  HelpCircle,
  Megaphone,
} from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import "../forms/BatchForm.css";
import type { Batch, BatchStatus } from "../../../api/types/batch";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropDown";
import {
  useBatches,
  useActivateBatch,
  useArchiveBatch,
} from "../../../hooks/useBatches";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { durationLabel, formatPrice } from "../../../helpers/duration";
import { fmt } from "../../../helpers/utilities";

interface BatchesTableProps {
  search?: string;
  status?: BatchStatus | "";
  session?: string;
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onEdit: (batch: Batch) => void;
  onAssignSupervisor: (batch: Batch) => void;
  onManageCurricula: (batch: Batch) => void;
  onAssignQuiz: (batch: Batch) => void;
  onAnnounce: (batch: Batch) => void;
  onDeleteRequest: (batch: Batch) => void;
}

function supervisorLabel(batch: Batch): string {
  const u = batch.supervisor?.user;
  if (u) return `${u.firstName} ${u.lastName}`.trim();
  return "—";
}

export default function BatchesTable({
  search,
  status,
  session,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onEdit,
  onAssignSupervisor,
  onManageCurricula,
  onAssignQuiz,
  onAnnounce,
  onDeleteRequest,
}: BatchesTableProps) {
  const { data, isLoading } = useBatches({
    page,
    limit,
    search,
    status,
    session,
  });

  const { mutate: activate } = useActivateBatch();
  const { mutate: archive } = useArchiveBatch();

  const batches: Batch[] = data?.data ?? [];

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

  const columns: Column<Batch>[] = [
    { header: "Batch Name", accessor: "name" },
    { header: "Session", accessor: "session" },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      // `batch.duration` is the priced TIER. The number of weeks lives at
      // `batch.itPeriod.duration` — same word, different thing.
      header: "Duration",
      render: (row) =>
        row.duration ? (
          <>
            {durationLabel(row.duration)}
            <span
              style={{
                display: "block",
                fontSize: 11.5,
                color: "var(--color-text-muted)",
              }}
            >
              {formatPrice(row.duration.price)}
              {row.itPeriod?.duration
                ? ` · ${row.itPeriod.duration} week(s)`
                : ""}
            </span>
          </>
        ) : (
          // Legacy batches keep a null duration until the backfill has run.
          <span style={{ color: "var(--color-text-muted)" }}>Not set</span>
        ),
    },
    {
      header: "IT Period",
      render: (row) => (
        <>
          {row.itPeriod?.name ?? "—"}
          <span
            style={{
              display: "block",
              fontSize: 11.5,
              color: "var(--color-text-muted)",
            }}
          >
            {fmt(row.itPeriod?.startDate ?? null)} →{" "}
            {fmt(row.itPeriod?.endDate ?? null)}
          </span>
        </>
      ),
    },
    {
      header: "Supervisor",
      render: (row) => supervisorLabel(row),
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: "Edit",
              icon: <Edit2 size={13} />,
              onClick: () => onEdit(row),
              disabled: row.status === "archived",
            },
            {
              label: "Assign Supervisor",
              icon: <UserPlus size={13} />,
              onClick: () => onAssignSupervisor(row),
              disabled: row.status === "archived",
            },
            {
              label: "Curricula",
              icon: <BookOpen size={13} />,
              onClick: () => onManageCurricula(row),
              disabled: row.status === "archived",
            },
            {
              label: "Assign Quiz",
              icon: <HelpCircle size={13} />,
              onClick: () => onAssignQuiz(row),
              disabled: row.status === "archived",
            },
            {
              label: "Announce",
              icon: <Megaphone size={13} />,
              onClick: () => onAnnounce(row),
              disabled: row.status === "archived",
            },
            {
              label: "Activate",
              icon: <Zap size={13} />,
              onClick: () => activate({ id: row._id, activateStudents: true }),
              disabled: row.status !== "created",
            },
            {
              label: "Archive",
              icon: <Archive size={13} />,
              onClick: () => archive(row._id),
              disabled: row.status === "archived",
            },
            {
              label: "Delete",
              icon: <Trash2 size={13} />,
              onClick: () => onDeleteRequest(row),
              danger: true,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <GeneralTable<Batch>
      columns={columns}
      data={batches}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
