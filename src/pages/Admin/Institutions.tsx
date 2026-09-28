import { useState } from "react";
import { Building2 } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import StatusChangeDialog from "../../components/ui/Lifecycle/StatusChangeDialog";
import DeleteDialog from "../../components/ui/Lifecycle/DeleteDialog";
import type { LifecycleTarget } from "../../helpers/lifecycle";
import InstitutionForm from "../../components/admin/forms/InstitutionForm";
import InstitutionsTable from "../../components/admin/tables/InstitutionsTable";
import { useModal } from "../../context/ModalContext";
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

  const [statusTarget, setStatusTarget] = useState<LifecycleTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LifecycleTarget | null>(null);
  const asTarget = (i: Institution): LifecycleTarget => ({
    _id: i._id,
    name: i.name,
    isActive: i.isActive,
  });

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

      {/* ── Search + filters ── */}
      <div className="filter-selects-block filter-selects-block--with-search">
        <div className="filter-search-field">
          <span className="filter-label">Search</span>
          <SearchInput
            value={filters.search}
            onChange={(val) => setField("search", val)}
            placeholder="Search by name, code…"
            onClear={() => setField("search", "")}
          />
        </div>
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
          onToggleStatusRequest={(i) => setStatusTarget(asTarget(i))}
          onDeleteRequest={(i) => setDeleteTarget(asTarget(i))}
        />
      </div>

      <StatusChangeDialog
        resource="institution"
        target={statusTarget}
        onClose={() => setStatusTarget(null)}
      />
      <DeleteDialog
        key={deleteTarget?._id ?? "none"}
        resource="institution"
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
