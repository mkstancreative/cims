import type { PendingEvaluationsResponse } from "../../../api/types/evaluation";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { ClipboardCheck } from "lucide-react";

// Row shape returned by usePendingEvaluations()
export type PendingEvaluationRow = PendingEvaluationsResponse["data"][number];

// ─── Props ────────────────────────────────────────────────────────────────────

interface StudentEvaluationTableProps {
  data: PendingEvaluationRow[];
  isLoading: boolean;
  meta: TableMeta | null;
  onEvaluate: (row: PendingEvaluationRow) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function studentName(row: PendingEvaluationRow): string {
  const u = row.student?.user;
  const name = `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim();
  return name || "—";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentEvaluationTable({
  data,
  isLoading,
  meta,
  onEvaluate,
  onPageChange,
  onLimitChange,
}: StudentEvaluationTableProps) {
  const columns: Column<PendingEvaluationRow>[] = [
    {
      header: "Student",
      render: (row) => (
        <div>
          <div className="eval-student-name">{studentName(row)}</div>
          <div className="eval-student-reg">
            {row.student?.registrationNumber ?? "—"}
          </div>
        </div>
      ),
    },
    {
      header: "Batch",
      render: (row) => row.batch?.name ?? "—",
    },
    {
      header: "IT Status",
      render: (row) =>
        row.itStatus ? <StatusBadge status={row.itStatus} /> : "—",
    },
    {
      header: "Action",
      render: (row) => (
        <button
          className="eval-submit-btn"
          onClick={() => onEvaluate(row)}
          title="Submit evaluation"
        >
          <ClipboardCheck size={13} />
          Evaluate
        </button>
      ),
    },
  ];

  return (
    <>
      <style>{`
        .eval-student-name{font-size:13px;font-weight:600;color:var(--color-text-primary)}
        .eval-student-reg{font-size:11.5px;font-family:monospace;color:var(--color-text-secondary);margin-top:2px}
        .eval-submit-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:8px;border:1.5px solid var(--color-accent);background:var(--color-accent-muted);color:var(--color-accent);font-size:12px;font-weight:700;cursor:pointer;transition:opacity .15s,background .15s}
        .eval-submit-btn:hover{background:var(--color-accent);color:#fff}
      `}</style>

      <GeneralTable<PendingEvaluationRow>
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
