import { useState } from "react";
import { Users } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import AdminStudentsTable from "../../components/admin/tables/AdminStudentsTable";
import type { Student, ITStatus } from "../../api/types/student";
import type { TableMeta } from "../../components/ui/GeneralTable/GeneralTable";
import { useNavigate } from "react-router-dom";
import { useUnassignedStudents } from "../../hooks/useStudents";
import { useBatches, useDepartments } from "../../hooks/useBatches";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";

interface FilterStates {
  batchId: string;
  department: string;
  itStatus: ITStatus | "";
  search: string;
  page: number;
  limit: number;
}

export default function UnAssignedStudents() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FilterStates>({
    batchId: "",
    department: "",
    itStatus: "",
    search: "",
    page: 1,
    limit: 10,
  });

  const setField = <K extends keyof FilterStates>(
    field: K,
    value: FilterStates[K],
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const { data: batches } = useBatches();
  const { data: departments } = useDepartments();

  const { data, isLoading } = useUnassignedStudents(filters);
  const students: Student[] = data?.data ?? [];
  const meta: TableMeta | null = data
    ? {
        page: data.page,
        pages: data.pages,
        count: data.total,
        limit: filters.limit,
        hasPrev: data.page > 1,
        hasNext: data.page < data.pages,
      }
    : null;

  const handleView = (student: Student) =>
    navigate(`/admin/students/${student._id}`);
  const handleProgress = (student: Student) =>
    navigate(`/admin/students/${student._id}/progress`);

  const handleReset = () => {
    setFilters({
      batchId: "",
      department: "",
      itStatus: "",
      search: "",
      page: 1,
      limit: 10,
    });
  };

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Users size={20} />
          </div>
          <div>
            <h2 className="page-title">Unassigned Students</h2>
            <p className="page-sub">Students without a supervisor</p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="filter-wrapper">
        <SearchInput
          value={filters.search}
          onChange={(val) => setField("search", val)}
          placeholder="Search by name, reg. number…"
          onClear={handleReset}
        />
      </div>

      <div className="filter-selects-block">
        <SelectFilter
          label="Batch"
          options={[
            { value: "", label: "All Batches" },
            ...(batches?.data.map((b) => ({ value: b._id, label: b.name })) ||
              []),
          ]}
          value={filters.batchId}
          onChange={(value) => setField("batchId", value)}
          name="batchId"
        />
        <SelectFilter
          label="Department"
          options={[
            { value: "", label: "All Departments" },
            ...(departments?.data.map((d) => ({ value: d, label: d })) || []),
          ]}
          value={filters.department}
          onChange={(value) => setField("department", value)}
          name="department"
        />
        <SelectFilter
          label="IT Status"
          options={[
            { value: "", label: "All IT Status" },
            { value: "placed", label: "Placed" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
          ]}
          value={filters.itStatus}
          onChange={(value) => setField("itStatus", value as ITStatus | "")}
          name="itStatus"
        />
        <ResetButton onClick={handleReset} />
      </div>

      {/* ── Table (read-only) ── */}
      <div className="table-wrapper">
        <AdminStudentsTable
          students={students}
          meta={meta}
          loading={isLoading}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setField("limit", l)}
          onView={handleView}
          onProgress={handleProgress}
          onUpdateStatus={() => {}}
          hideSelection
          hideSession
          hideDeptCode
          hideActions
        />
      </div>
    </div>
  );
}
