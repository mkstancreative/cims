import { useState } from "react";
import { ClipboardList, Download } from "lucide-react";
import {
  useCompositeResults,
  usePendingEvaluations,
} from "../../hooks/useEvaluations";
import StudentEvaluationTable from "../../components/supervisor/tables/StudentEvaluationTable";
import {
  pendingDepartment,
  pendingStudentName,
  type PendingEvaluationRow,
} from "../../helpers/evaluation";
import { useModal } from "../../context/ModalContext";
import type {
  CompositeResultsParams,
  Evaluation,
  EvaluationStatus,
} from "../../api/types/evaluation";
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
import { EvaluateFirstNotice } from "../../components/supervisor/EvaluateFirstNotice";
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

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;

  const csv =
    "\uFEFF" + // UTF-8 BOM so Excel reads correctly
    [headers, ...csvRows].map((r) => r.map(escape).join(",")).join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `evaluation-results-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Page ──────────────────────────────────────────────────────────────────────
type Tab = "pending" | "results";

export default function StudentsEvaluations() {
  // Pending first: it's the list the supervisor acts on.
  const [tab, setTab] = useState<Tab>("pending");

  // ── Pending evaluations ──
  const { data: pendingData, isLoading: pendingLoading } =
    usePendingEvaluations();
  const pendingAll: PendingEvaluationRow[] = pendingData?.data ?? [];
  const pendingCount = pendingData?.total ?? pendingAll.length;
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingDept, setPendingDept] = useState("");
  const [pendingBatch, setPendingBatch] = useState("");
  const [pendingItStatus, setPendingItStatus] = useState("");

  // ── Filter state (results) ──
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [batchId, setBatchId] = useState("");
  const [status, setStatus] = useState<EvaluationStatus | "">("");
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

  // ── Pending: filter the loaded list — the endpoint takes no filters ──
  // Departments: the supervisor's list only holds departments with ACTIVE
  // students, so add any the pending rows carry (e.g. completed students').
  const pendingDeptNames = [
    ...new Set([
      ...deptNames,
      ...pendingAll.map(pendingDepartment).filter((d) => d !== "—"),
    ]),
  ].sort((a, b) => a.localeCompare(b));
  const pendingQuery = pendingSearch.trim().toLowerCase();
  const pendingRows = pendingAll.filter(
    (row) =>
      (!pendingQuery ||
        [pendingStudentName(row), row.student?.registrationNumber ?? ""].some(
          (v) => v.toLowerCase().includes(pendingQuery),
        )) &&
      (!pendingDept || pendingDepartment(row) === pendingDept) &&
      (!pendingBatch || row.batch?._id === pendingBatch) &&
      (!pendingItStatus || row.itStatus === pendingItStatus),
  );

  const pendingFilterSections: FilterSection[] = [
    {
      key: "department",
      label: "Department",
      options: [
        { value: "", label: "All Departments" },
        ...pendingDeptNames.map((d) => ({ value: d, label: d })),
      ],
      value: pendingDept,
      onChange: setPendingDept,
    },
    {
      key: "batch",
      label: "Batch",
      options: [
        { value: "", label: "All Batches" },
        ...batches.map((b) => ({ value: b._id, label: b.name })),
      ],
      value: pendingBatch,
      onChange: setPendingBatch,
    },
    {
      key: "itStatus",
      label: "IT Status",
      options: [
        { value: "", label: "All IT Statuses" },
        { value: "placed", label: "Placed" },
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
        { value: "abandoned", label: "Abandoned" },
      ],
      value: pendingItStatus,
      onChange: setPendingItStatus,
    },
  ];

  // Clears the filters but keeps the search text.
  const clearPendingFilters = () => {
    setPendingDept("");
    setPendingBatch("");
    setPendingItStatus("");
  };

  const resetPending = () => {
    clearPendingFilters();
    setPendingSearch("");
  };

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
  const openEvaluate = (studentId: string, name: string) =>
    openModal(
      <SubmitEvaluationForm
        isOpen
        onClose={closeModal}
        studentId={studentId}
        studentName={name}
        onSuccess={closeModal}
      />,
    );

  const handleEvaluatePending = (row: PendingEvaluationRow) => {
    const studentId = row.student?._id;
    if (!studentId) return;
    const name = pendingStudentName(row);
    openEvaluate(
      studentId,
      name !== "—" ? name : (row.student?.registrationNumber ?? "Student"),
    );
  };

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
        // Evaluate the internship this result belongs to, not whichever is
        // current now.
        internshipId={
          typeof ev.internship === "string" ? ev.internship : undefined
        }
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
        // Supervisor's half done — waiting on the student's quiz score.
        { value: "awaiting-quiz", label: "Awaiting quiz" },
        { value: "completed", label: "Completed" },
      ],
      value: status,
      onChange: (v) => {
        setStatus(v as EvaluationStatus | "");
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
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: "var(--color-text-primary)",
            }}
          >
            {studentName(row)}
          </div>
          <div
            style={{
              fontSize: 11.5,
              fontFamily: "monospace",
              color: "var(--color-text-secondary)",
              marginTop: 2,
            }}
          >
            {studentReg(row)}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) =>
        row.status ? (
          <StatusBadge
            status={row.status}
            title={
              row.status === "awaiting-quiz"
                ? "Your evaluation is in — waiting on the student's quiz score."
                : undefined
            }
          />
        ) : (
          "—"
        ),
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
        row.status === "completed" ? (
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Done
          </span>
        ) : row.status === "awaiting-quiz" ? (
          // Your half is in. Re-submitting is allowed (it overwrites), so
          // offer it quietly rather than as the main action.
          <span className="eval-done-cell">
            <span>Your part is done</span>
            <button
              className="eval-update-btn"
              onClick={() => handleEvaluate(row)}
              title="Update your evaluation — this overwrites what you submitted"
            >
              Update
            </button>
          </span>
        ) : (
          <button
            className="eval-submit-btn"
            onClick={() => handleEvaluate(row)}
            title="Submit evaluation"
          >
            Evaluate
          </button>
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
              Evaluate your students and review their composite results
            </p>
          </div>
        </div>

        {/* Export — results tab only */}
        {tab === "results" && (
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
        )}
      </div>

      {/* The evaluation now opens the quiz — evaluate before the sitting. */}
      <EvaluateFirstNotice />

      {/* ── Tabs ── */}
      <div className="eval-tabs" role="tablist" aria-label="Evaluations">
        <button
          type="button"
          role="tab"
          id="eval-tab-pending"
          aria-selected={tab === "pending"}
          aria-controls="eval-panel-pending"
          className={`eval-tab${tab === "pending" ? " is-active" : ""}`}
          onClick={() => setTab("pending")}
        >
          Pending evaluations
          {!pendingLoading && (
            <span className="eval-tab__count">{pendingCount}</span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          id="eval-tab-results"
          aria-selected={tab === "results"}
          aria-controls="eval-panel-results"
          className={`eval-tab${tab === "results" ? " is-active" : ""}`}
          onClick={() => setTab("results")}
        >
          All results
        </button>
      </div>

      {tab === "pending" ? (
        <div
          id="eval-panel-pending"
          role="tabpanel"
          aria-labelledby="eval-tab-pending"
          className="eval-panel"
        >
          <div className="filter-wrapper fp-toolbar">
            <div className="fp-toolbar__row">
              <div className="fp-toolbar__search">
                <SearchInput
                  value={pendingSearch}
                  onChange={setPendingSearch}
                  onClear={() => setPendingSearch("")}
                  placeholder="Search by name or reg number…"
                />
              </div>
              <FilterPopover
                sections={pendingFilterSections}
                onClearAll={clearPendingFilters}
              />
              <ResetButton onClick={resetPending} />
            </div>
            <ActiveFilterChips
              sections={pendingFilterSections}
              onClearAll={clearPendingFilters}
            />
          </div>

          <div className="table-wrapper">
            <StudentEvaluationTable
              data={pendingRows}
              isLoading={pendingLoading}
              meta={null}
              onEvaluate={handleEvaluatePending}
              onPageChange={() => {}}
              onLimitChange={() => {}}
            />
          </div>
        </div>
      ) : (
        <div
          id="eval-panel-results"
          role="tabpanel"
          aria-labelledby="eval-tab-results"
          className="eval-panel"
        >
          {/* ── Search + filters ── */}
          <div className="filter-wrapper fp-toolbar">
            <div className="fp-toolbar__row">
              <div className="fp-toolbar__search">
                <SearchInput
                  value={search}
                  onChange={(v) => {
                    setSearch(v);
                    setPage(1);
                  }}
                  onClear={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  placeholder="Search by reg number…"
                />
              </div>
              <FilterPopover
                sections={filterSections}
                onClearAll={clearFilters}
              />
              <ResetButton onClick={handleReset} />
            </div>
            <ActiveFilterChips
              sections={filterSections}
              onClearAll={clearFilters}
            />
          </div>

          {/* ── Table ── */}
          <div className="table-wrapper">
            <GeneralTable<Evaluation>
              columns={columns}
              data={rows}
              loading={isLoading}
              meta={meta}
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        .eval-tabs{display:flex;gap:4px;padding:4px;border:1px solid var(--color-border);border-radius:12px;background:var(--color-bg-secondary);width:fit-content;max-width:100%}
        .eval-tab{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 16px;border:none;border-radius:9px;background:none;font:inherit;font-size:13.5px;font-weight:600;color:var(--color-text-secondary);cursor:pointer;transition:background .15s,color .15s}
        .eval-tab:hover{color:var(--color-text-primary);background:var(--color-surface-overlay)}
        .eval-tab:focus,.eval-tab:active{border:none}
        .eval-tab:focus-visible{outline:2px solid var(--color-accent);outline-offset:2px}
        .eval-tab.is-active{background:var(--color-accent);color:var(--color-on-primary)}
        .eval-tab__count{min-width:20px;padding:0 7px;border-radius:999px;background:var(--color-accent-muted);font-size:12px;line-height:20px;text-align:center;color:var(--color-accent)}
        .eval-tab.is-active .eval-tab__count{background:var(--color-on-primary);color:var(--color-accent)}
        .eval-panel{display:flex;flex-direction:column;gap:20px}
        .eval-submit-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:8px;border:1.5px solid var(--color-accent);background:var(--color-accent-muted);color:var(--color-accent);font-size:12px;font-weight:700;cursor:pointer;transition:opacity .15s,background .15s}
        .eval-done-cell{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:var(--color-text-muted)}
        .eval-update-btn{padding:3px 10px;border:1px solid var(--color-border);border-radius:7px;background:var(--color-bg-secondary);font:inherit;font-size:11.5px;font-weight:600;color:var(--color-text-secondary);cursor:pointer}
        .eval-update-btn:hover{border-color:var(--color-accent-border);color:var(--color-accent)}
        .eval-update-btn:focus,.eval-update-btn:active{border:1px solid var(--color-border)}
        .eval-submit-btn:hover{background:var(--color-accent);color:#fff}
        .eval-export-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:1px solid var(--color-primary-hover);background:rgba(var(--color-primary-rgb), .1);color:var(--color-primary-hover);font-size:13px;font-weight:600;cursor:pointer;transition:background .15s,color .15s}
        .eval-export-btn:hover:not(:disabled){background:var(--color-primary-hover);color:#fff}
        .eval-export-btn:disabled{opacity:.45;cursor:not-allowed}
      `}</style>
    </div>
  );
}
