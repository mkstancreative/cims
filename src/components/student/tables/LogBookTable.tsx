import { Eye, Trash2, Pencil } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropDown";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import { useMemo } from "react";
import { useLogBooks } from "../../../hooks/useLogBooks";
import { useMyCurriculum } from "../../../hooks/useCurriculum";
import type { Curriculum } from "../../../api/types/curriculum";
import { formatDate } from "../../../helpers/utilities";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
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
  /** The internship was abandoned, or is a past one — its logbooks are locked. */
  readOnly?: boolean;
  /** Show this internship's logbooks instead of the current one's. */
  internshipId?: string;
  batchId?: string;
}

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
  readOnly = false,
  internshipId,
  batchId,
}: LogBookTableProps) {
  const { data, isLoading } = useLogBooks({
    page,
    limit,
    search,
    status,
    ...(internshipId && { internshipId }),
    ...(batchId && { batchId }),
  });

  const logbooks: LogBookListItem[] = data?.data ?? [];

  // The list sends topic / subtopic populated ({ _id, title }). If one ever
  // arrives as a bare id, name it from the student's curriculum instead.
  const { data: curriculumData } = useMyCurriculum();
  const titles = useMemo(() => {
    const map = new Map<string, string>();
    const curricula: Curriculum[] = curriculumData?.data?.curricula ?? [];
    for (const c of curricula)
      for (const t of c.topics ?? []) {
        if (t._id) map.set(t._id, t.title);
        for (const st of t.subtopics ?? [])
          if (st._id) map.set(st._id, st.title);
      }
    return map;
  }, [curriculumData]);
  const titleOf = (ref?: string | { _id: string; title?: string }) => {
    if (!ref) return "—";
    if (typeof ref === "object") return ref.title || titles.get(ref._id) || "—";
    return titles.get(ref) || "—";
  };

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
      header: "Topic",
      render: (row) => (
        <span className="lbt-cell" title={titleOf(row.topic)}>
          {titleOf(row.topic)}
        </span>
      ),
    },
    {
      header: "Subtopic",
      render: (row) => (
        <span
          className="lbt-cell lbt-cell--muted"
          title={titleOf(row.subtopic)}
        >
          {titleOf(row.subtopic)}
        </span>
      ),
    },
    {
      header: "Hours",
      render: (row) => `${row.hoursSpent} hrs`,
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
                readOnly ||
                (row.status !== "draft" && row.status !== "needs_revision"),
            },
            {
              label: "Delete",
              icon: <Trash2 size={13} />,
              onClick: () => onDeleteRequest(row),
              danger: true,
              disabled: readOnly || row.status === "approved",
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <style>{`
        .lbt-cell{display:block;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:600;color:var(--color-text-primary)}
        .lbt-cell--muted{font-weight:500;color:var(--color-text-secondary)}
      `}</style>
      <GeneralTable<LogBookListItem>
        columns={columns}
        data={logbooks}
        loading={isLoading}
        meta={meta}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </>
  );
}
