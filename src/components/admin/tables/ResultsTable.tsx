import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import { GradeBadge } from "../../shared/dashboard/DashboardKit";
import { useCompositeResults } from "../../../hooks/useEvaluations";
import type {
  Evaluation,
  CompositeResultsParams,
} from "../../../api/types/evaluation";

interface ResultsTableProps {
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
}

function studentName(ev: Evaluation): string {
  if (ev.student && typeof ev.student === "object") {
    const u = ev.student.user;
    if (u) return `${u.firstName} ${u.lastName}`.trim();
  }
  return "—";
}

function num(value?: number): string {
  return value !== undefined && value !== null ? String(value) : "—";
}

export default function ResultsTable({
  page,
  limit,
  onPageChange,
  onLimitChange,
}: ResultsTableProps) {
  const params: CompositeResultsParams = { page, limit };

  const { data, isLoading } = useCompositeResults(params);

  const rows: Evaluation[] = data?.data ?? [];
  const currentPage = data?.page ?? 1;
  const pages = data?.pages ?? 1;
  const meta: TableMeta | null = data
    ? {
        page: currentPage,
        pages,
        count: data.total ?? rows.length,
        limit,
        hasPrev: currentPage > 1,
        hasNext: currentPage < pages,
      }
    : null;

  const columns: Column<Evaluation>[] = [
    {
      header: "Rank",
      render: (_row, i) => (
        <span style={{ fontWeight: 700 }}>
          {(currentPage - 1) * limit + i + 1}
        </span>
      ),
    },
    { header: "Student", render: (row) => studentName(row) },
    { header: "Total Score", render: (row) => num(row.totalScore) },
    { header: "Quiz Score", render: (row) => num(row.quizScore) },
    { header: "Final Score", render: (row) => num(row.finalScore) },
    {
      header: "Grade",
      render: (row) =>
        row.finalGrade ? <GradeBadge grade={row.finalGrade} /> : "—",
    },
  ];

  return (
    <GeneralTable<Evaluation>
      columns={columns}
      data={rows}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
