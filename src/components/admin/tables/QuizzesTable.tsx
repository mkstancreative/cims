import { Eye, Ban, Pencil, CheckCircle, Trash2 } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import ActionDropDown from "../../ui/ActionDropdown/ActionDropDown";
import { useQuizzes } from "../../../hooks/useQuizzes";
import type { QuizListItem, QuizParams } from "../../../api/types/quiz";
import {
  liveSittingReason,
  type LiveQuizSitting,
} from "../../../hooks/useQuizSessions";

interface QuizzesTableProps {
  search?: string;
  isActive?: "" | "true" | "false";
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onView: (quiz: QuizListItem) => void;
  onEdit: (quiz: QuizListItem) => void;
  /** Activate / deactivate — the everyday, reversible control. */
  onToggleStatusRequest: (quiz: QuizListItem) => void;
  /** Permanent delete (preflighted by the dialog). */
  onDeleteRequest: (quiz: QuizListItem) => void;
  /**
   * Quizzes with an unlocked sitting — the API refuses to edit, reorder or
   * deactivate them until it closes, so those controls are disabled here.
   */
  liveSittings?: Map<string, LiveQuizSitting>;
}

export default function QuizzesTable({
  search,
  isActive,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onView,
  onEdit,
  onToggleStatusRequest,
  onDeleteRequest,
  liveSittings,
}: QuizzesTableProps) {
  const params: QuizParams = {
    page,
    limit,
    ...(isActive ? { isActive: isActive === "true" } : {}),
  };

  const { data, isLoading } = useQuizzes(params);

  const rowsAll: QuizListItem[] = data?.data ?? [];
  // Search is client-side against the current page (list endpoint has no search param).
  const rows = search
    ? rowsAll.filter((q) =>
        q.title.toLowerCase().includes(search.toLowerCase()),
      )
    : rowsAll;

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

  const columns: Column<QuizListItem>[] = [
    {
      header: "Title",
      render: (row) => {
        const live = liveSittings?.get(row._id);
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {row.title}
            {live && (
              <StatusBadge
                status="active"
                label="Live sitting"
                title={liveSittingReason(live)}
              />
            )}
          </span>
        );
      },
    },
    { header: "Questions", render: (row) => row.questionCount },
    { header: "Pass Mark", render: (row) => `${row.passMark}%` },
    {
      header: "Time Limit",
      render: (row) =>
        row.durationMinutes ? (
          `${row.durationMinutes} min`
        ) : (
          <span style={{ color: "var(--color-text-muted)" }}>None</span>
        ),
    },
    {
      header: "Status",
      render: (row) => (
        <StatusBadge status={row.isActive ? "active" : "inactive"} />
      ),
    },
    {
      header: "Actions",
      render: (row) => {
        const live = liveSittings?.get(row._id);
        const reason = live ? liveSittingReason(live) : undefined;
        return (
          <ActionDropDown
            actions={[
              {
                label: "View Quiz",
                icon: <Eye size={13} />,
                onClick: () => onView(row),
              },
              {
                label: live ? "Edit Quiz (being sat)" : "Edit Quiz",
                icon: <Pencil size={13} />,
                onClick: () => onEdit(row),
                disabled: Boolean(live),
                title: reason,
              },
              {
                label: row.isActive ? "Deactivate" : "Activate",
                icon: row.isActive ? (
                  <Ban size={13} />
                ) : (
                  <CheckCircle size={13} />
                ),
                onClick: () => onToggleStatusRequest(row),
                // Deactivating mid-sitting is refused; REactivating is always
                // allowed — it's the repair for an accidental deactivate.
                disabled: Boolean(live) && row.isActive,
                title: live && row.isActive ? reason : undefined,
              },
              {
                label: "Delete permanently",
                icon: <Trash2 size={13} />,
                onClick: () => onDeleteRequest(row),
                danger: true,
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <GeneralTable<QuizListItem>
      columns={columns}
      data={rows}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
