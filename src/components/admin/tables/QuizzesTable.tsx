import { Eye, Ban } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import ActionDropDown from "../../ui/ActionDropdown/ActionDropDown";
import { useQuizzes } from "../../../hooks/useQuizzes";
import type { QuizListItem, QuizParams } from "../../../api/types/quiz";

interface QuizzesTableProps {
  search?: string;
  isActive?: "" | "true" | "false";
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onView: (quiz: QuizListItem) => void;
  onDeactivateRequest: (quiz: QuizListItem) => void;
}

export default function QuizzesTable({
  search,
  isActive,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onView,
  onDeactivateRequest,
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
    { header: "Title", accessor: "title" },
    { header: "Questions", render: (row) => row.questionCount },
    { header: "Pass Mark", render: (row) => `${row.passMark}%` },
    {
      header: "Status",
      render: (row) => (
        <StatusBadge status={row.isActive ? "active" : "inactive"} />
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropDown
          actions={[
            {
              label: "View Quiz",
              icon: <Eye size={13} />,
              onClick: () => onView(row),
            },
            {
              label: "Deactivate",
              icon: <Ban size={13} />,
              onClick: () => onDeactivateRequest(row),
              danger: true,
              disabled: !row.isActive,
            },
          ]}
        />
      ),
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
