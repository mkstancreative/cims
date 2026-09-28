import { Layers } from "lucide-react";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import {
  useAssignedStudents,
  useMyDepartments,
} from "../../hooks/useSchoolSupervisor";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import "../../components/ui/SelectFilter/SelectFilter.css";

import AssignedStudentView from "../../components/supervisor/views/AssignedStudentView";
import AssignedStudentTable from "../../components/supervisor/tables/AssignedStudentTable";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useModal } from "../../context/ModalContext";
import type { StudentSummary } from "../../api/types/schoolSupervisor";

export default function AssignedStudents() {
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
    itStatus: "" as "active" | "inactive" | "completed" | "",
  });

  // Department lives in the URL so the dashboard's department rows can link
  // straight to a filtered list. It's the department NAME — there's no id.
  const [searchParams, setSearchParams] = useSearchParams();
  const department = searchParams.get("department") ?? "";
  const setDepartment = (name: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (name) next.set("department", name);
        else next.delete("department");
        return next;
      },
      { replace: true },
    );
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const { data: deptResp } = useMyDepartments({ limit: 100 });
  const deptNames = (deptResp?.data ?? []).map((d) => d.name);
  // Keep a linked-to department selectable even if it has no active students
  // (the departments list only includes departments with active ones).
  if (department && !deptNames.includes(department)) deptNames.push(department);

  const { data, isLoading } = useAssignedStudents({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search.trim() && { search: filters.search.trim() }),
    ...(department && { department }),
  });

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
    setDepartment("");
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

      <div className="filter-selects-block filter-selects-block--with-search">
        <div className="filter-search-field">
          <span className="filter-label">Search</span>
          <SearchInput
            value={filters.search}
            onChange={(val) =>
              setFilters((prev) => ({ ...prev, search: val, page: 1 }))
            }
            placeholder="Search by name, reg number…"
            onClear={() =>
              setFilters((prev) => ({ ...prev, search: "", page: 1 }))
            }
          />
        </div>
        <SelectFilter
          label="Department"
          options={[
            { value: "", label: "All Departments" },
            ...deptNames.map((n) => ({ value: n, label: n })),
          ]}
          value={department}
          onChange={setDepartment}
          name="department"
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
