import { Layers } from "lucide-react";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import { useAssignedStudents } from "../../hooks/useSchoolSupervisor";

import AssignedStudentView from "../../components/supervisor/views/AssignedStudentView";
import AssignedStudentTable from "../../components/supervisor/tables/AssignedStudentTable";
import { useState } from "react";
import { useModal } from "../../context/ModalContext";
import type { StudentSummary } from "../../api/types/schoolSupervisor";

export default function AssignedStudents() {
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
    itStatus: "" as "active" | "inactive" | "completed" | "",
  });

  const { data, isLoading } = useAssignedStudents({ page: filters.page });

  const { openModal, closeModal } = useModal();

  const meta = {
    count: data?.total ?? 0,
    page: data?.page ?? 1,
    pages: data?.pages ?? 1,
    limit: filters.limit,
    hasPrev: (data?.page ?? 1) > 1,
    hasNext: (data?.page ?? 1) < (data?.pages ?? 1),
  };

  const handleView = (student: StudentSummary) => {
    openModal(
      <AssignedStudentView
        isOpen
        studentId={student._id}
        onClose={closeModal}
      />,
    );
  };

  const handleReset = () => {
    setFilters({ search: "", page: 1, limit: 10, itStatus: "" });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="page-title">Assigned Students</h2>
            <p className="page-sub">Manage assigned students</p>
          </div>
        </div>
      </div>

      <div className="filter-wrapper">
        <SearchInput
          value={filters.search}
          onChange={(val) =>
            setFilters((prev) => ({ ...prev, search: val, page: 1 }))
          }
          placeholder="Search by name, reg number…"
          onClear={handleReset}
        />
        <ResetButton onClick={handleReset} />
      </div>

      <div className="table-wrapper">
        <AssignedStudentTable
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
