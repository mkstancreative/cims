import {
  Eye,
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
import { useQuizzes } from "../../../hooks/useQuizzes";
import { batchQuizTitle } from "../../../helpers/batchQuiz";
import { supervisorName } from "../../../helpers/batchSupervisor";

interface BatchesTableProps {
  search?: string;
  status?: BatchStatus | "";
  session?: string;
  /** Client-side: show only batches with / without a supervisor. */
  supervisorFilter?: "" | "assigned" | "unassigned";
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onView: (batch: Batch) => void;
  onEdit: (batch: Batch) => void;
  onAssignSupervisor: (batch: Batch) => void;
  onManageCurricula: (batch: Batch) => void;
  onAssignQuiz: (batch: Batch) => void;
  onAnnounce: (batch: Batch) => void;
  onDeleteRequest: (batch: Batch) => void;
}


export default function BatchesTable({
  search,
  status,
  session,
  supervisorFilter = "",
  page,
  limit,
  onPageChange,
  onLimitChange,
  onView,
  onEdit,
  onAssignSupervisor,
  onManageCurricula,
  onAssignQuiz,
  onAnnounce,
  onDeleteRequest,
}: BatchesTableProps) {
  // There's no supervisor filter server-side, so while it's on, load every
  // batch in one go and filter + paginate here (GeneralTable pages the rows
  // itself when `meta` is null). Otherwise page on the server as usual.
  const filtering = Boolean(supervisorFilter);
  const { data, isLoading } = useBatches({
    page: filtering ? 1 : page,
    limit: filtering ? 1000 : limit,
    search,
    status,
    session,
  });

  // Names quizzes that batches carry as a bare id.
  const { data: quizzesResp } = useQuizzes({ limit: 100 });
  const quizNames = new Map(
    (quizzesResp?.data ?? []).map((q) => [q._id, q.title]),
  );

  const { mutate: activate } = useActivateBatch();
  const { mutate: archive } = useArchiveBatch();

  const allBatches: Batch[] = data?.data ?? [];
  const batches = filtering
    ? allBatches.filter((b) =>
        supervisorFilter === "assigned" ? b.supervisor : !b.supervisor,
      )
    : allBatches;

  const meta: TableMeta | null =
    data && !filtering
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
    {
      header: "Batch Name",
      render: (row) => (
        <button
          type="button"
          className="bt-name"
          onClick={() => onView(row)}
          title="View batch"
        >
          {row.name}
        </button>
      ),
    },
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
      render: (row) => {
        const name = supervisorName(row.supervisor);
        if (name) return name;
        // Unassigned means nobody reviews these students' logbooks — make it
        // an action, not a dash.
        return (
          <button
            type="button"
            className="bt-assign-sup"
            onClick={() => onAssignSupervisor(row)}
            disabled={row.status === "archived"}
          >
            <UserPlus size={12} /> Assign supervisor
          </button>
        );
      },
    },
    {
      header: "Quiz",
      render: (row) => {
        const title = batchQuizTitle(row, quizNames);
        return (
          <button
            type="button"
            className={`bt-quiz${title ? "" : " bt-quiz--none"}`}
            onClick={() => onAssignQuiz(row)}
            disabled={row.status === "archived"}
            title={title ? "Change or reuse this quiz" : "Assign a quiz"}
          >
            {title ?? "Not assigned"}
          </button>
        );
      },
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: "View",
              icon: <Eye size={13} />,
              onClick: () => onView(row),
            },
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
              label: "Manage Quiz",
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
