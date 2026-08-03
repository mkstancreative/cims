import CustomModal from "../../ui/CustomModal/CustomModal";
import { useLogBookById, useSubmitLogBook } from "../../../hooks/useLogBooks";
import { useMyCurriculum } from "../../../hooks/useCurriculum";
import type { LogBookListItem, LogBook } from "../../../api/types/logbook";
import type { Curriculum } from "../../../api/types/curriculum";
import {
  BookOpen,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Send,
} from "lucide-react";
import { formatDate } from "../../../helpers/utilities";
import { dayOfWeek } from "../../../helpers/logbook";
import "./LogBookView.css";

interface LogBookViewProps {
  isOpen: boolean;
  onClose: () => void;
  logbook: LogBookListItem;
}

export default function LogBookView({
  isOpen,
  onClose,
  logbook,
}: LogBookViewProps) {
  const { data, isLoading: isLoadingEntry } = useLogBookById(logbook._id);
  const { data: curriculumData, isLoading: isLoadingCurriculum } = useMyCurriculum();

  const entry = data?.data;
  const curricula: Curriculum[] = curriculumData?.data?.curricula ?? [];
  const isLoading = isLoadingEntry || isLoadingCurriculum;

  // Resolve curriculum names
  const curriculumObj = curricula.find((c) => c._id === entry?.curriculum);
  const topicObj = curriculumObj?.topics?.find((t) => t._id === entry?.topic);
  const subtopicObj = topicObj?.subtopics?.find((s) => s._id === entry?.subtopic);

  const curriculumName = curriculumObj?.name ?? "—";
  const topicTitle = topicObj?.title ?? "—";
  const subtopicTitle = subtopicObj?.title ?? "—";

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Logbook Entry Details"
      subtitle={entry?.date ? formatDate(entry.date) : "View logbook entry"}
      icon={<BookOpen size={16} />}
      size="medium"
      isLoading={isLoading}
    >
      {!isLoading && (
        <LogBookViewInner
          entry={entry}
          curriculumName={curriculumName}
          topicTitle={topicTitle}
          subtopicTitle={subtopicTitle}
          status={logbook.status}
          id={logbook._id}
          onClose={onClose}
        />
      )}
    </CustomModal>
  );
}

function LogBookViewInner({
  entry,
  curriculumName,
  topicTitle,
  subtopicTitle,
  status,
  id,
  onClose,
}: {
  entry: LogBook | undefined;
  curriculumName: string;
  topicTitle: string;
  subtopicTitle: string;
  status: string;
  id: string;
  onClose: () => void;
}) {
  const { mutate: submit, isPending: submitting } = useSubmitLogBook();

  if (!entry) {
    return (
      <div className="lbv-error">
        <AlertCircle size={28} />
        <span>Could not load log book details.</span>
      </div>
    );
  }

  const e = entry;

  const statusMeta: Record<string, { label: string; cls: string }> = {
    draft: { label: "Draft", cls: "draft" },
    submitted: { label: "Submitted", cls: "submitted" },
    approved: { label: "Approved", cls: "approved" },
    rejected: { label: "Rejected", cls: "rejected" },
    needs_revision: { label: "Needs Revision", cls: "needs-revision" },
  };
  const sm = statusMeta[e.status] ?? { label: e.status, cls: "draft" };

  return (
    <div className="lbv-root">
      {/* ── Meta bar ── */}
      <div className="lbv-meta-bar">
        <div className="lbv-meta-item">
          <Calendar size={13} />
          <span>{e.date ? formatDate(e.date) : "—"}</span>
        </div>
        <div className="lbv-meta-item">
          <span className="lbv-day-badge" style={{ margin: 0 }}>
            {dayOfWeek(e.date)}
          </span>
        </div>
        <div className="lbv-meta-item">
          <Clock size={13} />
          <span>{e.hoursSpent ?? 0} hours</span>
        </div>
        <span className={`lbv-status ${sm.cls}`}>{sm.label}</span>
      </div>

      {/* ── Curriculum & Topics ── */}
      <div className="lbv-section">
        <h4 className="lbv-section-title">Training Curriculum Details</h4>
        <div className="lbv-details-grid">
          <div className="lbv-detail-row">
            <span className="lbv-detail-label">Curriculum</span>
            <span className="lbv-detail-value">{curriculumName}</span>
          </div>
          <div className="lbv-detail-row">
            <span className="lbv-detail-label">Topic</span>
            <span className="lbv-detail-value">{topicTitle}</span>
          </div>
          <div className="lbv-detail-row">
            <span className="lbv-detail-label">Subtopic</span>
            <span className="lbv-detail-value">{subtopicTitle}</span>
          </div>
        </div>
      </div>

      {/* ── Activity Notes ── */}
      <div className="lbv-section">
        <h4 className="lbv-section-title">Activity Notes</h4>
        <div className="lbv-notes-card">
          <p className="lbv-notes-text">{e.notes}</p>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="modal-actions">
        <button
          type="button"
          className="modal-cancel"
          onClick={onClose}
          disabled={submitting}
        >
          Close
        </button>

        {/* Submit for review — draft or needs revision */}
        {(status === "draft" || status === "needs_revision") && (
          <button
            type="button"
            className="modal-submit lbv-submit-btn"
            disabled={submitting}
            onClick={() => submit(id, { onSuccess: onClose })}
          >
            {submitting ? (
              "Submitting…"
            ) : (
              <>
                <Send size={13} /> Submit for Review
              </>
            )}
          </button>
        )}

        {/* Approved note */}
        {status === "approved" && (
          <span className="lbv-approved-note">
            <CheckCircle2 size={14} />
            Approved by supervisor
          </span>
        )}
      </div>
    </div>
  );
}
