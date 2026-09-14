import { useState } from "react";
import { Clock, Info } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import DurationForm from "../../components/admin/forms/DurationForm";
import DurationsTable from "../../components/admin/tables/DurationsTable";
import { useModal } from "../../context/ModalContext";
import {
  useDeleteDuration,
  useUpdateDuration,
} from "../../hooks/useDurations";
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

  // Deactivation is the soft delete; reactivation is an update, because
  // bringing a retired tier back is deliberate.
  const { mutate: deactivate, isPending: deactivating } = useDeleteDuration();
  const { mutate: update, isPending: reactivating } = useUpdateDuration();
  const [toggleTarget, setToggleTarget] = useState<Duration | null>(null);

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

  const targetActive = toggleTarget?.isActive !== false;

  const confirmToggle = () => {
    if (!toggleTarget) return;
    if (targetActive) {
      deactivate(toggleTarget._id, {
        onSuccess: () => setToggleTarget(null),
      });
    } else {
      update(
        { id: toggleTarget._id, data: { isActive: true } },
        { onSuccess: () => setToggleTarget(null) },
      );
    }
  };

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
          onToggleStatusRequest={setToggleTarget}
        />
      </div>

      <ConfirmModal
        isOpen={Boolean(toggleTarget)}
        variant={targetActive ? "danger" : "success"}
        title={targetActive ? "Deactivate Duration" : "Activate Duration"}
        message={
          toggleTarget
            ? targetActive
              ? `Deactivate "${durationLabel(toggleTarget)}"? It will be refused if the tier is still attached to live batches or open registrations.`
              : `Activate "${durationLabel(toggleTarget)}"? Students will be able to choose it again.`
            : ""
        }
        confirmText={targetActive ? "Yes, Deactivate" : "Yes, Activate"}
        cancelText="Cancel"
        isPending={deactivating || reactivating}
        onConfirm={confirmToggle}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}
