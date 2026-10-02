import { useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useModal } from "../../context/ModalContext";
import type { LogBookListItem, LogBookStatus } from "../../api/types/logbook";
import { ArrowLeft, BookOpen, ClipboardCheck } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import AddButton from "../../components/ui/AddButton/AddButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import LogBookTable from "../../components/student/tables/LogBookTable";
import CreateLogBookDraft from "../../components/student/forms/CreateLogBookDraft";
import LogBookView from "../../components/student/view/LogBookView";
import { useDeleteLogBook } from "../../hooks/useLogBooks";
import {
  useCurrentInternshipAbandoned,
  useMyInternshipHistory,
} from "../../hooks/useInternships";
import { AbandonedNotice } from "../../components/student/dashboard/AbandonedNotice";
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

/**
 * The student's logbook. At `/student/logbook` it's the current internship's;
 * at `/student/internships/:internshipId/logbooks?batchId=…` (from My
 * Internships) it's that internship's — read-only unless it's the current one.
 */
export default function LogBook() {
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const location = useLocation();
  const { internshipId } = useParams<{ internshipId: string }>();
  const [searchParams] = useSearchParams();
  const batchId = searchParams.get("batchId") ?? undefined;

  // Which internship this is, from the (cached) history list.
  const { data: historyResp } = useMyInternshipHistory();
  const internship = internshipId
    ? historyResp?.data?.find((i) => i._id === internshipId)
    : undefined;
  const batch =
    internship?.batch && typeof internship.batch !== "string"
      ? internship.batch
      : undefined;
  const isPast = Boolean(internshipId) && !internship?.isCurrent;
  const isCompleted = internship?.itStatus === "completed";

  // Back to wherever they came from (My Internships, or the evaluation);
  // opened directly, there's no in-app history, so go to My Internships.
  const goBack = () =>
    location.key !== "default"
      ? navigate(-1)
      : navigate("/student/internships");

  const openEvaluation = () =>
    navigate(
      `/student/internships/${internshipId}/evaluation${batchId ? `?batchId=${batchId}` : ""}`,
    );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<LogBookStatus | "">("");

  const [deleteTarget, setDeleteTarget] = useState<LogBookListItem | null>(
    null,
  );

  const { mutate: remove, isPending: deleting } = useDeleteLogBook();
  // An abandoned internship's logbooks are locked server-side — hide the
  // actions rather than let them fail.
  const abandoned = useCurrentInternshipAbandoned();
  const locked = abandoned || isPast;

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
    openModal(
      <LogBookView
        isOpen
        onClose={closeModal}
        logbook={logbook}
        readOnly={locked}
      />,
    );

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
                {internshipId
                  ? batch
                    ? `${batch.name}${batch.session ? ` · ${batch.session}` : ""} — daily IT training entries`
                    : "Daily IT training entries for this internship"
                  : "Record and manage your daily IT training activities"}
              </p>
            </div>
          </div>
          <div className="page-header-right">
            {internshipId && (
              <button
                type="button"
                className="dash-btn dash-btn--ghost"
                onClick={goBack}
              >
                <ArrowLeft size={15} /> Back
              </button>
            )}
            {/* A finished internship has a final evaluation to look at. */}
            {internshipId && isCompleted && (
              <AddButton
                text="View Evaluation"
                icon={<ClipboardCheck size={15} />}
                onClick={openEvaluation}
              />
            )}
            {!locked && <AddButton text="New Entry" onClick={openCreate} />}
          </div>
        </div>

        {abandoned && !isPast && (
          <AbandonedNotice what="Its logbooks are locked — you can view them, but not add, edit or submit." />
        )}

        {/* ── Search + filters ── */}
        <div className="filter-selects-block filter-selects-block--with-search">
          <div className="filter-search-field">
            <span className="filter-label">Search</span>
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search by notes…"
              onClear={() => {
                setSearch("");
                setPage(1);
              }}
            />
          </div>
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
            readOnly={locked}
            internshipId={internshipId}
            batchId={batchId}
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
