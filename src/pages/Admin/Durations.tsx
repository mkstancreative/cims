import { useState } from "react";
import { Clock, Info } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import StatusChangeDialog from "../../components/ui/Lifecycle/StatusChangeDialog";
import DeleteDialog from "../../components/ui/Lifecycle/DeleteDialog";
import type { LifecycleTarget } from "../../helpers/lifecycle";
import DurationForm from "../../components/admin/forms/DurationForm";
import DurationsTable from "../../components/admin/tables/DurationsTable";
import { useModal } from "../../context/ModalContext";
import type { Duration } from "../../api/types/duration";
import { durationLabel } from "../../helpers/duration";
import "../../components/admin/forms/BatchForm.css";

interface FilterState {
  isActive: "" | "true" | "false";
  page: number;
  limit: number;
}

export default function Durations() {
  const { openModal, closeModal } = useModal();

  const [filters, setFilters] = useState<FilterState>({
    isActive: "",
    page: 1,
    limit: 10,
  });

  const setField = <K extends keyof FilterState>(
    field: K,
    value: FilterState[K],
  ) => setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));

  // Status is the everyday, reversible control (PATCH …/status); deleting is
  // permanent and preflighted. `isActive` is optional on legacy rows — absent
  // means active.
  const [statusTarget, setStatusTarget] = useState<LifecycleTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LifecycleTarget | null>(null);
  const asTarget = (d: Duration): LifecycleTarget => ({
    _id: d._id,
    name: durationLabel(d),
    isActive: d.isActive !== false,
  });

  const openCreate = () =>
    openModal(<DurationForm key="new" isOpen onClose={closeModal} />);
  const openEdit = (duration: Duration) =>
    openModal(
      <DurationForm
        key={duration._id}
        isOpen
        onClose={closeModal}
        editing={duration}
      />,
    );

  const handleReset = () =>
    setFilters({ isActive: "", page: 1, limit: 10 });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Clock size={20} />
          </div>
          <div>
            <h2 className="page-title">Durations</h2>
            <p className="page-sub">
              Priced placement periods students choose at registration — drag to
              reorder
            </p>
          </div>
        </div>
        <div className="page-header-right">
          <AddButton text="Add Duration" onClick={openCreate} />
        </div>
      </div>

      <div
        className="bf-note"
        style={{
          background: "var(--color-accent-muted)",
          color: "var(--color-text-secondary)",
          marginBottom: 16,
        }}
      >
        <Info size={14} />
        <span>
          Durations are a menu, not a ladder — a student may pick any active
          period at registration and any active one again on re-enrolment.
          Ranges may overlap; you will be warned but not blocked. Drag a row to
          change the order students see them in.
        </span>
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
        <DurationsTable
          isActive={filters.isActive}
          page={filters.page}
          limit={filters.limit}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setField("limit", l)}
          onEdit={openEdit}
          onToggleStatusRequest={(d) => setStatusTarget(asTarget(d))}
          onDeleteRequest={(d) => setDeleteTarget(asTarget(d))}
        />
      </div>

      <StatusChangeDialog
        resource="duration"
        target={statusTarget}
        onClose={() => setStatusTarget(null)}
      />
      <DeleteDialog
        key={deleteTarget?._id ?? "none"}
        resource="duration"
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
