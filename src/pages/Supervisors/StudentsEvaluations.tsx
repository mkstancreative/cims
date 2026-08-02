import { useMemo, useState } from "react";
import { ClipboardList, Search } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import StudentEvaluationTable, {
  type PendingEvaluationRow,
} from "../../components/supervisor/tables/StudentEvaluationTable";
import SubmitEvaluationForm from "../../components/supervisor/forms/SubmitEvaluationForm";
import { usePendingEvaluations } from "../../hooks/useEvaluations";
import { useModal } from "../../context/ModalContext";

function rowName(row: PendingEvaluationRow): string {
  const u = row.student?.user;
  return `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim();
}

export default function StudentsEvaluations() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = usePendingEvaluations();
  const { openModal, closeModal } = useModal();

  const rows = useMemo(() => data?.data ?? [], [data]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const name = rowName(row).toLowerCase();
      const reg = (row.student?.registrationNumber ?? "").toLowerCase();
      return name.includes(q) || reg.includes(q);
    });
  }, [rows, search]);

  const handleEvaluate = (row: PendingEvaluationRow) => {
    const studentId = row.student?._id;
    if (!studentId) return;
    openModal(
      <SubmitEvaluationForm
        isOpen
        onClose={closeModal}
        studentId={studentId}
        studentName={rowName(row) || row.student?.registrationNumber || "Student"}
        onSuccess={closeModal}
      />,
    );
  };

  const handleReset = () => setSearch("");

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
              Submit evaluations for students awaiting your assessment
            </p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="filter-wrapper">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or reg number…"
          onClear={() => setSearch("")}
        />
        <ResetButton onClick={handleReset} />
      </div>

      {/* ── Summary ── */}
      {!isLoading && rows.length > 0 && (
        <div className="eval-summary-bar">
          <span className="eval-summary-item">
            <Search size={12} />
            {rows.length} student{rows.length !== 1 ? "s" : ""} awaiting
            evaluation
          </span>
          <style>{`
            .eval-summary-bar{display:flex;align-items:center;gap:16px;padding:10px 16px;background:var(--color-bg-secondary);border:1px solid var(--color-border);border-radius:10px;font-size:12.5px;color:var(--color-text-secondary);flex-wrap:wrap}
            .eval-summary-item{display:inline-flex;align-items:center;gap:5px}
          `}</style>
        </div>
      )}

      {/* ── Table ── */}
      <div className="table-wrapper">
        <StudentEvaluationTable
          data={filteredRows}
          isLoading={isLoading}
          meta={null}
          onEvaluate={handleEvaluate}
          onPageChange={() => {}}
          onLimitChange={() => {}}
        />
      </div>
    </div>
  );
}
