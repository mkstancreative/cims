import { useState, type FormEvent } from "react";
import { useModal } from "../../context/ModalContext";
import {
  useDeleteBatch,
  useAssignBatchSupervisor,
  useLinkBatchCurriculum,
  useAssignBatchQuiz,
} from "../../hooks/useBatches";
import { useSupervisors } from "../../hooks/useSupervisors";
import { useCurricula } from "../../hooks/useCurriculum";
import { useQuizzes } from "../../hooks/useQuizzes";
import type { Batch, BatchStatus } from "../../api/types/batch";
import BatchForm from "../../components/admin/forms/BatchForm";
import { Layers, UserPlus, BookOpen, HelpCircle } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import BatchesTable from "../../components/admin/tables/BatchesTable";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import CustomModal from "../../components/ui/CustomModal/CustomModal";
import Spinner from "../../components/ui/Spinner/Spinner";

interface FilterState {
  search: string;
  page: number;
  limit: number;
  status: BatchStatus | "";
  session: string;
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

// ── Link curriculum modal ─────────────────────────────────────────────────────
function LinkCurriculumModal({
  batch,
  onClose,
}: {
  batch: Batch;
  onClose: () => void;
}) {
  const [curriculumId, setCurriculumId] = useState("");
  const { data, isLoading } = useCurricula({ limit: 100, isActive: true });
  const { mutate: link, isPending } = useLinkBatchCurriculum();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!curriculumId) return;
    link({ id: batch._id, curriculumId }, { onSuccess: onClose });
  };

  return (
    <CustomModal
      isOpen
      onClose={onClose}
      title="Link Curriculum"
      subtitle={`Link a curriculum to ${batch.name}`}
      icon={<BookOpen size={16} />}
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
            form="link-curriculum-form"
            className="modal-submit"
            disabled={isPending || !curriculumId}
          >
            {isPending ? <Spinner size={14} color="#fff" text="" /> : "Link"}
          </button>
        </>
      }
    >
      <form id="link-curriculum-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="modal-label">
            Curriculum <span>*</span>
          </label>
          <select
            className="modal-input"
            value={curriculumId}
            onChange={(e) => setCurriculumId(e.target.value)}
            required
            disabled={isLoading}
          >
            <option value="">
              {isLoading ? "Loading…" : "Select a curriculum"}
            </option>
            {data?.data.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </form>
    </CustomModal>
  );
}

// ── Assign quiz modal ─────────────────────────────────────────────────────────
function AssignQuizModal({
  batch,
  onClose,
}: {
  batch: Batch;
  onClose: () => void;
}) {
  const [quizId, setQuizId] = useState("");
  const { data, isLoading } = useQuizzes({ limit: 100, isActive: true });
  const { mutate: assign, isPending } = useAssignBatchQuiz();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!quizId) return;
    assign({ id: batch._id, quizId }, { onSuccess: onClose });
  };

  return (
    <CustomModal
      isOpen
      onClose={onClose}
      title="Assign Quiz"
      subtitle={`Assign a quiz to ${batch.name}`}
      icon={<HelpCircle size={16} />}
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
            form="assign-quiz-form"
            className="modal-submit"
            disabled={isPending || !quizId}
          >
            {isPending ? <Spinner size={14} color="#fff" text="" /> : "Assign"}
          </button>
        </>
      }
    >
      <form id="assign-quiz-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="modal-label">
            Quiz <span>*</span>
          </label>
          <select
            className="modal-input"
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
            required
            disabled={isLoading}
          >
            <option value="">
              {isLoading ? "Loading…" : "Select a quiz"}
            </option>
            {data?.data.map((q) => (
              <option key={q._id} value={q._id}>
                {q.title}
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
      <BatchForm key={batch._id} isOpen onClose={closeModal} editing={batch} />,
    );

  const handleReset = () => {
    setFilter({ search: "", page: 1, limit: 10, status: "", session: "" });
  };

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

        <div className="filter-wrapper">
          <SearchInput
            value={filter.search}
            onChange={(val) => setField("search", val)}
            placeholder="Search by name, session…"
            onClear={handleReset}
          />
        </div>

        <div className="filter-selects-block">
          <SelectFilter
            label="Status"
            options={[
              { value: "", label: "All Status" },
              { value: "created", label: "Created" },
              { value: "active", label: "Active" },
              { value: "completed", label: "Completed" },
              { value: "archived", label: "Archived" },
            ]}
            value={filter.status}
            onChange={(value) => setField("status", value as BatchStatus | "")}
            name="status"
          />
          <ResetButton onClick={handleReset} />
        </div>

        <div className="table-wrapper">
          <BatchesTable
            search={filter.search}
            status={filter.status}
            session={filter.session}
            page={filter.page}
            limit={filter.limit}
            onPageChange={(p) => setFilter((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setField("limit", l)}
            onEdit={openEdit}
            onAssignSupervisor={(batch) =>
              openModal(
                <AssignSupervisorModal batch={batch} onClose={closeModal} />,
              )
            }
            onLinkCurriculum={(batch) =>
              openModal(
                <LinkCurriculumModal batch={batch} onClose={closeModal} />,
              )
            }
            onAssignQuiz={(batch) =>
              openModal(<AssignQuizModal batch={batch} onClose={closeModal} />)
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
