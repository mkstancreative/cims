import { useState } from "react";
import { ClipboardList, Download } from "lucide-react";
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
import {
  ActiveFilterChips,
  FilterPopover,
  type FilterSection,
} from "../../components/ui/FilterPopover/FilterPopover";
import { useMyBatches } from "../../hooks/useBatches";
import { useMyDepartments } from "../../hooks/useSchoolSupervisor";
import type { Batch } from "../../api/types/batch";

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

  // Only the supervisor's own batches — `/batches` is admin-only.
  const { data: myBatchesData } = useMyBatches();
  const batches: Batch[] =
    (myBatchesData as { data?: Batch[] } | undefined)?.data ?? [];
  // The supervisor's own departments — `/admin/all-departments` is admin-only.
  const { data: deptsData } = useMyDepartments({ limit: 100 });
  const deptNames = (deptsData?.data ?? []).map((d) => d.name);
  if (department && !deptNames.includes(department)) deptNames.push(department);

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

  // Clears the filters but keeps whatever is typed in the search box.
  const clearFilters = () => {
    setDepartment("");
    setBatchId("");
    setStatus("");
    setGrade("");
    setPage(1);
  };

  const filterSections: FilterSection[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All Statuses" },
        { value: "pending", label: "Pending" },
        { value: "completed", label: "Completed" },
      ],
      value: status,
      onChange: (v) => {
        setStatus(v as "pending" | "completed" | "");
        setPage(1);
      },
    },
    {
      key: "grade",
      label: "Grade",
      options: [
        { value: "", label: "All Grades" },
        ...GRADE_OPTIONS.map((g) => ({ value: g, label: `Grade ${g}` })),
      ],
      value: grade,
      onChange: (v) => {
        setGrade(v as Grade | "");
        setPage(1);
      },
    },
    {
      key: "batchId",
      label: "Batch",
      options: [
        { value: "", label: "All Batches" },
        ...batches.map((b) => ({ value: b._id, label: b.name })),
      ],
      value: batchId,
      onChange: (v) => {
        setBatchId(v);
        setPage(1);
      },
    },
    {
      key: "department",
      label: "Department",
      options: [
        { value: "", label: "All Departments" },
        ...deptNames.map((d) => ({ value: d, label: d })),
      ],
      value: department,
      onChange: (v) => {
        setDepartment(v);
        setPage(1);
      },
    },
  ];

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

      {/* ── Search + filters ── */}
      <div className="filter-wrapper fp-toolbar">
        <div className="fp-toolbar__row">
          <div className="fp-toolbar__search">
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              onClear={() => { setSearch(""); setPage(1); }}
              placeholder="Search by reg number…"
            />
          </div>
          <FilterPopover sections={filterSections} onClearAll={clearFilters} />
          <ResetButton onClick={handleReset} />
        </div>
        <ActiveFilterChips sections={filterSections} onClearAll={clearFilters} />
      </div>

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
        .eval-submit-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:8px;border:1.5px solid var(--color-accent);background:var(--color-accent-muted);color:var(--color-accent);font-size:12px;font-weight:700;cursor:pointer;transition:opacity .15s,background .15s}
        .eval-submit-btn:hover{background:var(--color-accent);color:#fff}
        .eval-export-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:1px solid var(--color-primary-hover);background:rgba(var(--color-primary-rgb), .1);color:var(--color-primary-hover);font-size:13px;font-weight:600;cursor:pointer;transition:background .15s,color .15s}
        .eval-export-btn:hover:not(:disabled){background:var(--color-primary-hover);color:#fff}
        .eval-export-btn:disabled{opacity:.45;cursor:not-allowed}
      `}</style>
    </div>
  );
}
