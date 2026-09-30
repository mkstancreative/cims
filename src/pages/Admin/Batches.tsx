import { useState, type FormEvent } from "react";
import { useModal } from "../../context/ModalContext";
import {
  useDeleteBatch,
  useAssignBatchSupervisor,
} from "../../hooks/useBatches";
import { useSupervisors } from "../../hooks/useSupervisors";
import type { Batch, BatchStatus } from "../../api/types/batch";
import BatchForm from "../../components/admin/forms/BatchForm";
import BatchAnnouncementForm from "../../components/admin/forms/BatchAnnouncementForm";
import ManageBatchCurriculaModal from "../../components/admin/forms/ManageBatchCurriculaModal";
import BatchQuizModal from "../../components/admin/forms/BatchQuizModal";
import BatchViewModal from "../../components/admin/view/BatchViewModal";
import { Layers, UserPlus } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import BatchesTable from "../../components/admin/tables/BatchesTable";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import {
  ActiveFilterChips,
  FilterPopover,
  type FilterSection,
} from "../../components/ui/FilterPopover/FilterPopover";
import CustomModal from "../../components/ui/CustomModal/CustomModal";
import Spinner from "../../components/ui/Spinner/Spinner";

interface FilterState {
  search: string;
  page: number;
  limit: number;
  status: BatchStatus | "";
  session: string;
  /** Find batches nobody is supervising. */
  supervisor: "" | "assigned" | "unassigned";
}

// ── Assign supervisor modal ───────────────────────────────────────────────────
function AssignSupervisorModal({
  batch,
  onClose,
}: {
  batch: Batch;
  onClose: () => void;
}) {
  const [supervisorId, setSupervisorId] = useState(batch.supervisor?._id ?? "");
  const { data, isLoading } = useSupervisors({ limit: 100 });
  const { mutate: assign, isPending } = useAssignBatchSupervisor();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!supervisorId) return;
    assign({ id: batch._id, supervisorId }, { onSuccess: onClose });
  };

  return (
    <CustomModal
      isOpen
      onClose={onClose}
      title="Assign Supervisor"
      subtitle={`Assign a supervisor to ${batch.name}`}
      icon={<UserPlus size={16} />}
      size="medium"
      footer={
        <>
          <button
            type="button"
            className="modal-cancel"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="assign-supervisor-form"
            className="modal-submit"
            disabled={isPending || !supervisorId}
          >
            {isPending ? <Spinner size={14} color="#fff" text="" /> : "Assign"}
          </button>
        </>
      }
    >
      <form id="assign-supervisor-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="modal-label">
            Supervisor <span>*</span>
          </label>
          <select
            className="modal-input"
            value={supervisorId}
            onChange={(e) => setSupervisorId(e.target.value)}
            required
            disabled={isLoading}
          >
            <option value="">
              {isLoading ? "Loading…" : "Select a supervisor"}
            </option>
            {data?.data.map((sv) => (
              <option key={sv._id} value={sv._id}>
                {sv.user.firstName} {sv.user.lastName}
                {sv.staffId ? ` (${sv.staffId})` : ""}
              </option>
            ))}
          </select>
        </div>
      </form>
    </CustomModal>
  );
}

export default function Batches() {
  const { openModal, closeModal } = useModal();

  const [filter, setFilter] = useState<FilterState>({
    search: "",
    page: 1,
    limit: 10,
    status: "",
    session: "",
    supervisor: "",
  });

  const setField = <K extends keyof FilterState>(
    field: K,
    value: FilterState[K],
  ) => {
    setFilter((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const { mutate: remove, isPending: deleting } = useDeleteBatch();
  const [deleteTarget, setDeleteTarget] = useState<Batch | null>(null);

  const confirmDelete = () => {
    if (deleteTarget) {
      remove(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) });
    }
  };

  const openCreate = () =>
    openModal(<BatchForm key="new" isOpen onClose={closeModal} />);
  const openEdit = (batch: Batch) =>
    openModal(
      <BatchForm
        key={batch._id}
        isOpen
        onClose={closeModal}
        editingId={batch._id}
      />,
    );

  const openAssignSupervisor = (batch: Batch) =>
    openModal(<AssignSupervisorModal batch={batch} onClose={closeModal} />);

  const openView = (batch: Batch) =>
    openModal(
      <BatchViewModal
        key={batch._id}
        id={batch._id}
        onClose={closeModal}
        onEdit={openEdit}
        onAssignSupervisor={openAssignSupervisor}
      />,
    );

  const handleReset = () => {
    setFilter({
      search: "",
      page: 1,
      limit: 10,
      status: "",
      session: "",
      supervisor: "",
    });
  };

  // Clears the filters but keeps whatever is typed in the search box.
  const clearFilters = () =>
    setFilter((prev) => ({
      ...prev,
      status: "",
      session: "",
      supervisor: "",
      page: 1,
    }));

  const filterSections: FilterSection[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All Status" },
        { value: "created", label: "Created" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "archived", label: "Archived" },
      ],
      value: filter.status,
      onChange: (v) => setField("status", v as BatchStatus | ""),
    },
    {
      key: "supervisor",
      label: "Supervisor",
      options: [
        { value: "", label: "All Batches" },
        { value: "assigned", label: "Assigned" },
        { value: "unassigned", label: "Unassigned" },
      ],
      value: filter.supervisor,
      onChange: (v) => setField("supervisor", v as FilterState["supervisor"]),
    },
    {
      key: "session",
      label: "Session",
      input: { placeholder: "e.g. 2023/2024" },
      value: filter.session,
      onChange: (v) => setField("session", v),
    },
  ];

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon orange">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="page-title">Batches</h2>
              <p className="page-sub">
                Manage placement batches in the institution
              </p>
            </div>
          </div>
          <div className="page-header-right">
            <AddButton text="Add Batch" onClick={openCreate} />
          </div>
        </div>

        {/* ── Search + filters ── */}
        <div className="filter-wrapper fp-toolbar">
          <div className="fp-toolbar__row">
            <div className="fp-toolbar__search">
              <SearchInput
                value={filter.search}
                onChange={(val) => setField("search", val)}
                placeholder="Search by name, session…"
                onClear={() => setField("search", "")}
              />
            </div>
            <FilterPopover sections={filterSections} onClearAll={clearFilters} />
            <ResetButton onClick={handleReset} />
          </div>
          <ActiveFilterChips sections={filterSections} onClearAll={clearFilters} />
        </div>

        <div className="table-wrapper">
          <BatchesTable
            search={filter.search}
            status={filter.status}
            session={filter.session}
            supervisorFilter={filter.supervisor}
            page={filter.page}
            limit={filter.limit}
            onPageChange={(p) => setFilter((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setField("limit", l)}
            onView={openView}
            onEdit={openEdit}
            onAssignSupervisor={openAssignSupervisor}
            onManageCurricula={(batch) =>
              openModal(
                <ManageBatchCurriculaModal
                  key={batch._id}
                  batch={batch}
                  onClose={closeModal}
                />,
              )
            }
            onAssignQuiz={(batch) =>
              openModal(<BatchQuizModal batch={batch} onClose={closeModal} />)
            }
            onAnnounce={(batch) =>
              openModal(
                <BatchAnnouncementForm
                  key={batch._id}
                  isOpen
                  onClose={closeModal}
                  batch={batch}
                />,
              )
            }
            onDeleteRequest={setDeleteTarget}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        variant="danger"
        title="Delete Batch"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"?`
            : ""
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isPending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
