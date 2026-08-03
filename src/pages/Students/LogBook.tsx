import { useState } from "react";
import { useModal } from "../../context/ModalContext";
import type { LogBookListItem, LogBookStatus } from "../../api/types/logbook";
import { BookOpen } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import AddButton from "../../components/ui/AddButton/AddButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import LogBookTable from "../../components/student/tables/LogBookTable";
import CreateLogBookDraft from "../../components/student/forms/CreateLogBookDraft";
import LogBookView from "../../components/student/view/LogBookView";
import { useDeleteLogBook } from "../../hooks/useLogBooks";
import { formatDate } from "../../helpers/utilities";

// ─── Filter options ───────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "needs_revision", label: "Needs Revision" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LogBook() {
  const { openModal, closeModal } = useModal();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<LogBookStatus | "">("");

  const [deleteTarget, setDeleteTarget] = useState<LogBookListItem | null>(
    null,
  );

  const { mutate: remove, isPending: deleting } = useDeleteLogBook();

  const confirmDelete = () => {
    if (deleteTarget) {
      remove(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) });
    }
  };

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };

  const openCreate = () =>
    openModal(<CreateLogBookDraft isOpen onClose={closeModal} />);

  const openView = (logbook: LogBookListItem) =>
    openModal(<LogBookView isOpen onClose={closeModal} logbook={logbook} />);

  const openEdit = (logbook: LogBookListItem) =>
    openModal(
      <CreateLogBookDraft isOpen onClose={closeModal} logbook={logbook} />,
    );

  return (
    <>
      <div className="page-container">
        {/* ── Header ── */}
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon orange">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="page-title">Log Book</h2>
              <p className="page-sub">
                Record and manage your daily IT training activities
              </p>
            </div>
          </div>
          <div className="page-header-right">
            <AddButton text="New Entry" onClick={openCreate} />
          </div>
        </div>

        {/* ── Search + Reset ── */}
        <div className="filter-wrapper">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search by notes…"
            onClear={handleReset}
          />
        </div>

        {/* ── Filters ── */}
        <div className="filter-selects-block">
          <SelectFilter
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(val) => {
              setStatus(val as LogBookStatus | "");
              setPage(1);
            }}
            name="status"
          />
          <ResetButton onClick={handleReset} />
        </div>

        {/* ── Table ── */}
        <div className="table-wrapper">
          <LogBookTable
            search={search}
            status={status}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
            onView={openView}
            onEdit={openEdit}
            onDeleteRequest={setDeleteTarget}
          />
        </div>
      </div>

      {/* ── Delete Confirm ── */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        variant="danger"
        title="Delete Log Book Entry"
        message={
          deleteTarget
            ? `Are you sure you want to delete the entry for ${
                deleteTarget.date ? formatDate(deleteTarget.date) : "this day"
              }? This action cannot be undone.`
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
