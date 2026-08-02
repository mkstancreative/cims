import { useState } from "react";
import { Building2 } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import InstitutionForm from "../../components/admin/forms/InstitutionForm";
import InstitutionsTable from "../../components/admin/tables/InstitutionsTable";
import { useModal } from "../../context/ModalContext";
import { useToggleInstitutionStatus } from "../../hooks/useInstitutions";
import type { Institution } from "../../api/types/institution";

interface FilterState {
  search: string;
  isActive: "" | "true" | "false";
  page: number;
  limit: number;
}

export default function Institutions() {
  const { openModal, closeModal } = useModal();

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    isActive: "",
    page: 1,
    limit: 10,
  });

  const setField = <K extends keyof FilterState>(
    field: K,
    value: FilterState[K],
  ) => setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));

  const { mutate: toggleStatus, isPending: toggling } =
    useToggleInstitutionStatus();

  const [toggleTarget, setToggleTarget] = useState<Institution | null>(null);

  const openCreate = () =>
    openModal(<InstitutionForm key="new" isOpen onClose={closeModal} />);
  const openEdit = (institution: Institution) =>
    openModal(
      <InstitutionForm
        key={institution._id}
        isOpen
        onClose={closeModal}
        editing={institution}
      />,
    );

  const handleReset = () =>
    setFilters({ search: "", isActive: "", page: 1, limit: 10 });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="page-title">Institutions</h2>
            <p className="page-sub">Manage partner institutions</p>
          </div>
        </div>
        <div className="page-header-right">
          <AddButton text="Add Institution" onClick={openCreate} />
        </div>
      </div>

      <div className="filter-wrapper">
        <SearchInput
          value={filters.search}
          onChange={(val) => setField("search", val)}
          placeholder="Search by name, code…"
          onClear={handleReset}
        />
      </div>

      <div className="filter-selects-block">
        <SelectFilter
          label="Status"
          options={[
            { value: "", label: "All Status" },
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" },
          ]}
          value={filters.isActive}
          onChange={(value) =>
            setField("isActive", value as FilterState["isActive"])
          }
          name="isActive"
        />
        <ResetButton onClick={handleReset} />
      </div>

      <div className="table-wrapper">
        <InstitutionsTable
          search={filters.search}
          isActive={filters.isActive}
          page={filters.page}
          limit={filters.limit}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setField("limit", l)}
          onEdit={openEdit}
          onToggleStatusRequest={setToggleTarget}
        />
      </div>

      <ConfirmModal
        isOpen={Boolean(toggleTarget)}
        variant={toggleTarget?.isActive ? "danger" : "success"}
        title={
          toggleTarget?.isActive
            ? "Deactivate Institution"
            : "Activate Institution"
        }
        message={
          toggleTarget
            ? `Are you sure you want to ${
                toggleTarget.isActive ? "deactivate" : "activate"
              } "${toggleTarget.name}"?`
            : ""
        }
        confirmText={
          toggleTarget?.isActive ? "Yes, Deactivate" : "Yes, Activate"
        }
        cancelText="Cancel"
        isPending={toggling}
        onConfirm={() => {
          if (toggleTarget)
            toggleStatus(
              { id: toggleTarget._id, isActive: !toggleTarget.isActive },
              { onSuccess: () => setToggleTarget(null) },
            );
        }}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}
