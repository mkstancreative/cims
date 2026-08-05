import { useState } from "react";
import { BookOpen } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import CurriculumForm from "../../components/admin/forms/CurriculumForm";
import CurriculumTable from "../../components/admin/tables/CurriculumTable";
import CurriculumViewModal from "../../components/admin/view/CurriculumViewModal";
import { useModal } from "../../context/ModalContext";
import { useDeactivateCurriculum } from "../../hooks/useCurriculum";
import type { CurriculumListItem } from "../../api/types/curriculum";

interface FilterState {
  search: string;
  isActive: "" | "true" | "false";
  page: number;
  limit: number;
}

export default function Curriculum() {
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

  const { mutate: deactivate, isPending: deactivating } =
    useDeactivateCurriculum();

  const [deactivateTarget, setDeactivateTarget] =
    useState<CurriculumListItem | null>(null);

  const handleReset = () =>
    setFilters({ search: "", isActive: "", page: 1, limit: 10 });

  const openCreate = () =>
    openModal(<CurriculumForm key="new" isOpen onClose={closeModal} />);
  const openEdit = (curriculum: CurriculumListItem) =>
    openModal(
      <CurriculumForm
        key={curriculum._id}
        isOpen
        onClose={closeModal}
        editingId={curriculum._id}
      />,
    );
  const openView = (curriculum: CurriculumListItem) =>
    openModal(
      <CurriculumViewModal
        key={curriculum._id}
        isOpen
        onClose={closeModal}
        id={curriculum._id}
      />,
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="page-title">Curriculum</h2>
            <p className="page-sub">Manage curricula, topics and subtopics</p>
          </div>
        </div>
        <div className="page-header-right">
          <AddButton text="Add Curriculum" onClick={openCreate} />
        </div>
      </div>

      <div className="filter-wrapper">
        <SearchInput
          value={filters.search}
          onChange={(val) => setField("search", val)}
          placeholder="Search by name…"
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
        <CurriculumTable
          search={filters.search}
          isActive={filters.isActive}
          page={filters.page}
          limit={filters.limit}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setField("limit", l)}
          onView={openView}
          onEdit={openEdit}
          onDeactivateRequest={setDeactivateTarget}
        />
      </div>

      <ConfirmModal
        isOpen={Boolean(deactivateTarget)}
        variant="danger"
        title="Deactivate Curriculum"
        message={
          deactivateTarget
            ? `Are you sure you want to deactivate "${deactivateTarget.name}"?`
            : ""
        }
        confirmText="Yes, Deactivate"
        cancelText="Cancel"
        isPending={deactivating}
        onConfirm={() => {
          if (deactivateTarget)
            deactivate(deactivateTarget._id, {
              onSuccess: () => setDeactivateTarget(null),
            });
        }}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  );
}
