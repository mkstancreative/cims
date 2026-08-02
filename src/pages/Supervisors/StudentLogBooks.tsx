import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, Filter } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import AssignedStudentLogBookTable from "../../components/supervisor/tables/AssignedStudentLogBookTable";
import { useStudentLogbooks } from "../../hooks/useSchoolSupervisor";
import type { LogbookSummary } from "../../api/types/schoolSupervisor";

type StatusFilter =
  | "submitted"
  | "approved"
  | "rejected"
  | "needs_revision"
  | "";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "needs_revision", label: "Needs Revision" },
];

export default function StudentLogBooks() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: "",
    status: "" as StatusFilter,
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useStudentLogbooks(studentId ?? "", {
    search: filters.search || undefined,
    status: filters.status || undefined,
    page: filters.page,
    limit: filters.limit,
  });

  const meta = {
    count: data?.total ?? 0,
    page: data?.page ?? 1,
    pages: data?.pages ?? 1,
    limit: filters.limit,
    hasPrev: (data?.page ?? 1) > 1,
    hasNext: (data?.page ?? 1) < (data?.pages ?? 1),
  };

  const handleView = (logbook: LogbookSummary) => {
    navigate(`/supervisor/students/${studentId}/logbooks/${logbook._id}`);
  };

  const handleReset = () => {
    setFilters({ search: "", status: "", page: 1, limit: 10 });
  };

  return (
    <div className="page-container">
      <div className="page-header-left">
        <button
          className="dash-btn dash-btn--ghost"
          onClick={() => navigate("/supervisor/assigned-students")}
        >
          <ArrowLeft size={15} /> Assigned Students
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="page-title">Student Log Books</h2>
            <p className="page-sub">
              Review and manage weekly log book entries
            </p>
          </div>
        </div>
      </div>

      <div className="filter-wrapper">
        <SearchInput
          value={filters.search}
          onChange={(val) =>
            setFilters((prev) => ({ ...prev, search: val, page: 1 }))
          }
          placeholder="Search by title…"
          onClear={() =>
            setFilters((prev) => ({ ...prev, search: "", page: 1 }))
          }
        />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={14} style={{ color: "var(--color-text-secondary)" }} />
          <select
            className="modal-input"
            style={{ height: 38, minWidth: 160, fontSize: 13 }}
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value as StatusFilter,
                page: 1,
              }))
            }
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <ResetButton onClick={handleReset} />
      </div>

      <div className="table-wrapper">
        <AssignedStudentLogBookTable
          data={data?.data ?? []}
          isLoading={isLoading}
          meta={meta}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          onLimitChange={(limit) =>
            setFilters((prev) => ({ ...prev, limit, page: 1 }))
          }
          onView={handleView}
        />
      </div>
    </div>
  );
}
