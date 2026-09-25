import { useState } from "react";
import { ClipboardList, Search, Download } from "lucide-react";
import { useCompositeResults } from "../../hooks/useEvaluations";
import { useModal } from "../../context/ModalContext";
import type { CompositeResultsParams, Evaluation } from "../../api/types/evaluation";
import GeneralTable from "../../components/ui/GeneralTable/GeneralTable";
import type { Column } from "../../components/ui/GeneralTable/GeneralTable";
import { GradeBadge } from "../../components/shared/dashboard/DashboardKit";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import SubmitEvaluationForm from "../../components/supervisor/forms/SubmitEvaluationForm";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import "../../components/ui/SelectFilter/SelectFilter.css";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import { useBatches, useDepartments } from "../../hooks/useBatches";

// ─── Grade options ─────────────────────────────────────────────────────────────
const GRADE_OPTIONS = ["A", "B", "C", "D", "E", "F"] as const;
type Grade = (typeof GRADE_OPTIONS)[number];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function studentName(ev: Evaluation): string {
  if (ev.student && typeof ev.student === "object") {
    const u = ev.student.user;
    if (u) return `${u.firstName} ${u.lastName}`.trim();
  }
  return "—";
}

function studentReg(ev: Evaluation): string {
  if (ev.student && typeof ev.student === "object") {
    return ev.student.registrationNumber ?? "—";
  }
  return "—";
}

function num(value?: number): string {
  return value !== undefined && value !== null ? String(value) : "—";
}

// ─── CSV / Excel export ────────────────────────────────────────────────────────
function exportToExcel(rows: Evaluation[]) {
  const headers = [
    "Reg Number",
    "Student Name",
    "Status",
    "Total Score",
    "Quiz Score",
    "Final Score",
    "Grade",
  ];

  const csvRows = rows.map((row) => [
    studentReg(row),
    studentName(row),
    row.status ?? "—",
    num(row.totalScore),
    num(row.quizScore),
    num(row.finalScore),
    row.finalGrade ?? "—",
  ]);

  const escape = (v: string) =>
    `"${v.replace(/"/g, '""')}"`;

  const csv =
    "\uFEFF" + // UTF-8 BOM so Excel reads correctly
    [headers, ...csvRows]
      .map((r) => r.map(escape).join(","))
      .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `evaluation-results-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function StudentsEvaluations() {
  // ── Filter state ──
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [batchId, setBatchId] = useState("");
  const [status, setStatus] = useState<"pending" | "completed" | "">("");
  const [grade, setGrade] = useState<Grade | "">("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { openModal, closeModal } = useModal();

  const { data: batchesData } = useBatches();
  const { data: deptsData } = useDepartments();

  // ── Build params (omit empty values) ──
  const params: CompositeResultsParams = {
    ...(search.trim() && { search: search.trim() }),
    ...(department.trim() && { department: department.trim() }),
    ...(batchId.trim() && { batchId: batchId.trim() }),
    ...(status && { status }),
    ...(grade && { grade }),
    page,
    limit,
  };

  const { data, isLoading } = useCompositeResults(params);

  const rows: Evaluation[] = data?.data ?? [];
  const currentPage = data?.page ?? 1;
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;
  const meta = data
    ? {
        page: currentPage,
        pages,
        count: total,
        limit,
        hasPrev: currentPage > 1,
        hasNext: currentPage < pages,
      }
    : null;

  // ── Open evaluate modal ──
  const handleEvaluate = (ev: Evaluation) => {
    const s = typeof ev.student === "object" ? ev.student : null;
    const studentId = s?._id;
    if (!studentId) return;
    const name = studentName(ev) || studentReg(ev) || "Student";
    openModal(
      <SubmitEvaluationForm
        isOpen
        onClose={closeModal}
        studentId={studentId}
        studentName={name}
        onSuccess={closeModal}
      />,
    );
  };

  const handleReset = () => {
    setSearch("");
    setDepartment("");
    setBatchId("");
    setStatus("");
    setGrade("");
    setPage(1);
  };

  // ── Columns ──
  const columns: Column<Evaluation>[] = [
    {
      header: "#",
      render: (_row, i) => (
        <span style={{ fontWeight: 700 }}>
          {(currentPage - 1) * limit + i + 1}
        </span>
      ),
    },
    {
      header: "Student",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>
            {studentName(row)}
          </div>
          <div style={{ fontSize: 11.5, fontFamily: "monospace", color: "var(--color-text-secondary)", marginTop: 2 }}>
            {studentReg(row)}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => row.status ? <StatusBadge status={row.status} /> : "—",
    },
    { header: "Total Score", render: (row) => num(row.totalScore) },
    { header: "Quiz Score", render: (row) => num(row.quizScore) },
    { header: "Final Score", render: (row) => num(row.finalScore) },
    {
      header: "Grade",
      render: (row) =>
        row.finalGrade ? <GradeBadge grade={row.finalGrade} /> : "—",
    },
    {
      header: "Action",
      render: (row) =>
        row.status !== "completed" ? (
          <button
            className="eval-submit-btn"
            onClick={() => handleEvaluate(row)}
            title="Submit evaluation"
          >
            Evaluate
          </button>
        ) : (
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Done</span>
        ),
    },
  ];

  return (
    <div className="page-container">
      {/* ── Page header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="page-title">Student Evaluations</h2>
            <p className="page-sub">
              Composite results for all evaluated students
            </p>
          </div>
        </div>

        {/* Export button in header right */}
        <div className="page-header-right">
          <button
            className="eval-export-btn"
            onClick={() => exportToExcel(rows)}
            disabled={rows.length === 0 || isLoading}
            title="Export current page to Excel"
          >
            <Download size={14} />
            Export Excel
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="filter-wrapper">
        {/* Reg number search */}
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          onClear={() => { setSearch(""); setPage(1); }}
          placeholder="Search by reg number…"
        />
      </div>

      <div className="filter-selects-block">
        <SelectFilter
          label="Department"
          options={[
            { value: "", label: "All Departments" },
            ...(deptsData?.data.map((d) => ({ value: d, label: d })) || []),
          ]}
          value={department}
          onChange={(val) => { setDepartment(val); setPage(1); }}
          name="department"
        />

        <SelectFilter
          label="Batch"
          options={[
            { value: "", label: "All Batches" },
            ...(batchesData?.data.map((b) => ({ value: b._id, label: b.name })) || []),
          ]}
          value={batchId}
          onChange={(val) => { setBatchId(val); setPage(1); }}
          name="batchId"
        />

        <SelectFilter
          label="Status"
          options={[
            { value: "", label: "All Statuses" },
            { value: "pending", label: "Pending" },
            { value: "completed", label: "Completed" },
          ]}
          value={status}
          onChange={(val) => { setStatus(val as "pending" | "completed" | ""); setPage(1); }}
          name="status"
        />

        <SelectFilter
          label="Grade"
          options={[
            { value: "", label: "All Grades" },
            ...GRADE_OPTIONS.map((g) => ({ value: g, label: `Grade ${g}` })),
          ]}
          value={grade}
          onChange={(val) => { setGrade(val as Grade | ""); setPage(1); }}
          name="grade"
        />

        <ResetButton onClick={handleReset} />
      </div>

      {/* ── Summary bar ── */}
      {!isLoading && (
        <div className="eval-summary-bar">
          <span className="eval-summary-item">
            <Search size={12} />
            {total} result{total !== 1 ? "s" : ""}
          </span>
          {status && (
            <span className="eval-summary-item">Status: <strong>{status}</strong></span>
          )}
          {grade && (
            <span className="eval-summary-item">Grade: <strong>{grade}</strong></span>
          )}
          {department && (
            <span className="eval-summary-item">Dept: <strong>{department}</strong></span>
          )}
          {batchId && (
            <span className="eval-summary-item">Batch: <strong>{batchId}</strong></span>
          )}
        </div>
      )}

      {/* ── Table ── */}
      <div className="table-wrapper">
        <GeneralTable<Evaluation>
          columns={columns}
          data={rows}
          loading={isLoading}
          meta={meta}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
        />
      </div>

      <style>{`
        .eval-summary-bar{display:flex;align-items:center;gap:16px;padding:10px 16px;background:var(--color-bg-secondary);border:1px solid var(--color-border);border-radius:10px;font-size:12.5px;color:var(--color-text-secondary);flex-wrap:wrap}
        .eval-summary-item{display:inline-flex;align-items:center;gap:5px}
        .eval-submit-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:8px;border:1.5px solid var(--color-accent);background:var(--color-accent-muted);color:var(--color-accent);font-size:12px;font-weight:700;cursor:pointer;transition:opacity .15s,background .15s}
        .eval-submit-btn:hover{background:var(--color-accent);color:#fff}
        .eval-export-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:1px solid #4f46e5;background:rgba(79,70,229,.1);color:#4f46e5;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s,color .15s}
        .eval-export-btn:hover:not(:disabled){background:#4f46e5;color:#fff}
        .eval-export-btn:disabled{opacity:.45;cursor:not-allowed}
      `}</style>
    </div>
  );
}
