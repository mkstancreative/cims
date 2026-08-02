import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import RegistrationsTable from "../../components/admin/tables/RegistrationsTable";
import EnrollRegistrationForm from "../../components/admin/forms/EnrollRegistrationForm";
import RejectRegistrationForm from "../../components/admin/forms/RejectRegistrationForm";
import { useModal } from "../../context/ModalContext";
import type { Registration } from "../../api/types/registration";

interface FilterState {
  status: string;
  search: string;
  page: number;
  limit: number;
}

export default function Registrations() {
  const { openModal, closeModal } = useModal();

  const [filters, setFilters] = useState<FilterState>({
    status: "new",
    search: "",
    page: 1,
    limit: 10,
  });

  const setField = <K extends keyof FilterState>(
    field: K,
    value: FilterState[K],
  ) => setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));

  const handleReset = () =>
    setFilters({ status: "new", search: "", page: 1, limit: 10 });

  const openEnroll = (registration: Registration) =>
    openModal(
      <EnrollRegistrationForm
        key={registration._id}
        isOpen
        onClose={closeModal}
        registration={registration}
      />,
    );
  const openReject = (registration: Registration) =>
    openModal(
      <RejectRegistrationForm
        key={registration._id}
        isOpen
        onClose={closeModal}
        registration={registration}
      />,
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <ClipboardCheck size={20} />
          </div>
          <div>
            <h2 className="page-title">Registrations</h2>
            <p className="page-sub">Review and process applicant registrations</p>
          </div>
        </div>
      </div>

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
          label="Status"
          options={[
            { value: "new", label: "New" },
            { value: "enrolled", label: "Enrolled" },
            { value: "rejected", label: "Rejected" },
          ]}
          value={filters.status}
          onChange={(value) => setField("status", value)}
          name="status"
        />
        <ResetButton onClick={handleReset} />
      </div>

      <div className="table-wrapper">
        <RegistrationsTable
          search={filters.search}
          status={filters.status}
          page={filters.page}
          limit={filters.limit}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setField("limit", l)}
          onEnroll={openEnroll}
          onReject={openReject}
        />
      </div>
    </div>
  );
}
