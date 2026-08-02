import { useState } from "react";
import { Briefcase } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import InternshipsTable from "../../components/admin/tables/InternshipsTable";
import InternshipStatusForm from "../../components/admin/forms/InternshipStatusForm";
import { useModal } from "../../context/ModalContext";
import type {
  Internship,
  InternshipStatus,
} from "../../api/types/internship";

interface FilterState {
  status: InternshipStatus | "";
  search: string;
  page: number;
  limit: number;
}

export default function Internships() {
  const { openModal, closeModal } = useModal();

  const [filters, setFilters] = useState<FilterState>({
    status: "",
    search: "",
    page: 1,
    limit: 10,
  });

  const setField = <K extends keyof FilterState>(
    field: K,
    value: FilterState[K],
  ) => setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));

  const handleReset = () =>
    setFilters({ status: "", search: "", page: 1, limit: 10 });

  const openChangeStatus = (internship: Internship) =>
    openModal(
      <InternshipStatusForm
        key={internship._id}
        isOpen
        onClose={closeModal}
        internship={internship}
      />,
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Briefcase size={20} />
          </div>
          <div>
            <h2 className="page-title">Internships</h2>
            <p className="page-sub">Track and manage student internships</p>
          </div>
        </div>
      </div>

      <div className="filter-wrapper">
        <SearchInput
          value={filters.search}
          onChange={(val) => setField("search", val)}
          placeholder="Search by student name…"
          onClear={handleReset}
        />
      </div>

      <div className="filter-selects-block">
        <SelectFilter
          label="Status"
          options={[
            { value: "", label: "All Status" },
            { value: "placed", label: "Placed" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
          ]}
          value={filters.status}
          onChange={(value) =>
            setField("status", value as InternshipStatus | "")
          }
          name="status"
        />
        <ResetButton onClick={handleReset} />
      </div>

      <div className="table-wrapper">
        <InternshipsTable
          search={filters.search}
          status={filters.status}
          page={filters.page}
          limit={filters.limit}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setField("limit", l)}
          onChangeStatus={openChangeStatus}
        />
      </div>
    </div>
  );
}
