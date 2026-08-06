import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDate } from "../../../helpers/utilities";
import { dayOfWeek } from "../../../helpers/logbook";
import {
  useLogbookDetail,
  useReviewLogbook,
} from "../../../hooks/useSchoolSupervisor";
import { useCurriculum } from "../../../hooks/useCurriculum";
import type { Topic, Subtopic } from "../../../api/types/curriculum";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import "./AssignedStudentLogBookView.css";

// ─── Status meta ─────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "lbv2-status--draft" },
  submitted: { label: "Submitted", cls: "lbv2-status--submitted" },
  approved: { label: "Approved", cls: "lbv2-status--approved" },
  rejected: { label: "Rejected", cls: "lbv2-status--rejected" },
  needs_revision: { label: "Needs Revision", cls: "lbv2-status--revision" },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="lbv2-skeleton-wrap">
      <div className="lbv2-skel lbv2-skel--hero" />
      <div className="lbv2-skel lbv2-skel--block" />
      <div className="lbv2-skel lbv2-skel--block" />
      <div className="lbv2-skel lbv2-skel--block lbv2-skel--short" />
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function AssignedStudentLogBookView() {
  const { studentId = "", logbookId = "" } = useParams<{
    studentId: string;
    logbookId: string;
  }>();
  const navigate = useNavigate();

  const { data: response, isLoading: loadingLogbook } = useLogbookDetail(studentId, logbookId);
  const { mutate: submitReview, isPending: submitting } = useReviewLogbook(studentId);

  const [reviewText, setReviewText] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);

  const logbook = response?.data?.logbook;
  const student = response?.data?.student;

  // Resolve curriculum info for the supervisor view
  const { data: currResponse, isLoading: loadingCurriculum } = useCurriculum(logbook?.curriculum ?? "");
  const curriculum = currResponse?.data;

  const isLoading = loadingLogbook || loadingCurriculum;

  const statusEntry = logbook ? STATUS_META[logbook.status] : null;

  // Resolve curriculum names
  const topicObj = curriculum?.topics?.find((t: Topic) => t._id === logbook?.topic);
  const subtopicObj = topicObj?.subtopics?.find((s: Subtopic) => s._id === logbook?.subtopic);

  const curriculumName = curriculum?.name ?? "—";
  const topicTitle = topicObj?.title ?? "—";
  const subtopicTitle = subtopicObj?.title ?? "—";

  // Review can only be submitted for submitted logbooks
  const canReview = logbook?.status === "submitted";

  const handleSubmitReview = (action: "approve" | "reject") => {
    if (!reviewText.trim()) return;
    submitReview(
      { logbookId, action, comments: reviewText },
      { onSuccess: () => setReviewOpen(false) },
    );
  };

  return (
    <div className="page-container">
      {/* ── Back ── */}
      <div className="page-left">
        <button
          className="dash-btn dash-btn--ghost"
          onClick={() => navigate(`/supervisor/students/${studentId}/logbooks`)}
        >
          <ArrowLeft size={15} /> Log Books
        </button>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : !logbook || !student ? (
        <div className="lbv2-empty">
          <AlertCircle size={28} />
          <span>Could not load logbook details.</span>
        </div>
      ) : (
        <div className="lbv2-root">
          {/* ── Hero card ── */}
          <div className="lbv2-hero">
            <div className="lbv2-hero-left">
              <div className="lbv2-week-badge">
                <BookOpen size={14} />
                Logbook Entry
              </div>
              <h2 className="lbv2-title">
                {logbook.date ? formatDate(logbook.date) : "—"} ({dayOfWeek(logbook.date)})
              </h2>
              <div className="lbv2-meta-row">
                <span className="lbv2-meta-item">
                  <Clock size={13} />
                  {logbook.hoursSpent} hours logged
                </span>
              </div>
            </div>
            <div className="lbv2-hero-right">
              <span className={`lbv2-status-pill ${statusEntry?.cls ?? ""}`}>
                {statusEntry?.label ?? logbook.status}
              </span>
              <StatusBadge status={student.itStatus} />
            </div>
          </div>

          {/* ── Student mini-card ── */}
          <div className="lbv2-student-card">
            <div className="lbv2-sc-inner">
              <div className="lbv2-sc-row">
                <span className="lbv2-sc-label">Student</span>
                <span className="lbv2-sc-value">
                  {student.user.firstName} {student.user.lastName}
                </span>
              </div>
              <div className="lbv2-sc-row">
                <span className="lbv2-sc-label">Reg. Number</span>
                <span className="lbv2-sc-value lbv2-mono">
                  {student.registrationNumber}
                </span>
              </div>
              <div className="lbv2-sc-row">
                <span className="lbv2-sc-label">Program</span>
                <span className="lbv2-sc-value">
                  {student.program.type} — {student.program.level}
                </span>
              </div>
              <div className="lbv2-sc-row">
                <span className="lbv2-sc-label">Department</span>
                <span className="lbv2-sc-value">{student.department.name}</span>
              </div>
            </div>
          </div>

          {/* ── Training Curriculum Details ── */}
          <div className="lbv2-section">
            <h4 className="lbv2-section-title">Training Curriculum Details</h4>
            <div className="lbv2-details-grid">
              <div className="lbv2-detail-row">
                <span className="lbv2-detail-label">Curriculum</span>
                <span className="lbv2-detail-value">{curriculumName}</span>
              </div>
              <div className="lbv2-detail-row">
                <span className="lbv2-detail-label">Topic</span>
                <span className="lbv2-detail-value">{topicTitle}</span>
              </div>
              <div className="lbv2-detail-row">
                <span className="lbv2-detail-label">Subtopic</span>
                <span className="lbv2-detail-value">{subtopicTitle}</span>
              </div>
            </div>
          </div>

          {/* ── Activity Notes ── */}
          <div className="lbv2-section">
            <h4 className="lbv2-section-title">Activity Notes</h4>
            <div className="lbv2-notes-card">
              <p className="lbv2-notes-text">{logbook.notes}</p>
            </div>
          </div>

          {/* ── School Review Feedback ── */}
          {logbook.schoolReview?.comments && (
            <div className="lbv2-section">
              <h4 className="lbv2-section-title">Clinical Supervisor's Review</h4>
              <div className="lbv2-school-review">
                <div className="lbv2-school-review-box">
                  <div className="lbv2-school-review-head">
                    <CheckCircle2 size={16} className="lbv2-check-icon" />
                    <span>Your Review / Feedback</span>
                  </div>
                  <div
                    className="lbv2-school-comment"
                    dangerouslySetInnerHTML={{
                      __html: `"${logbook.schoolReview.comments}"`,
                    }}
                  />
                  {logbook.schoolReview.reviewedAt && (
                    <span className="lbv2-reviewed-at">
                      Review completed on{" "}
                      {formatDate(logbook.schoolReview.reviewedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── School Supervisor Review Panel ── */}
          <div className="lbv2-section">
            <button
              className="lbv2-review-toggle"
              onClick={() => setReviewOpen((o) => !o)}
              disabled={!canReview}
            >
              <span className="lbv2-review-toggle-left">
                <MessageSquare size={15} />
                {canReview ? "Write Review / Comment" : "Add School Review"}
              </span>
              {reviewOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {!canReview && (
              <div className="lbv2-review-hint">
                {logbook.status === "approved" ? (
                  <span className="lbv2-approved-note">
                    <CheckCircle2 size={13} /> This logbook has already been approved.
                  </span>
                ) : (
                  `Review is only available for logbooks in "submitted" status. Current status: ${logbook.status}.`
                )}
              </div>
            )}

            {reviewOpen && canReview && (
              <div className="lbv2-review-form">
                <label className="modal-label">
                  Your Comments
                  <span className="lbv2-required"> *</span>
                </label>
                <textarea
                  className="modal-input"
                  rows={4}
                  placeholder="Enter your review comments for this logbook entry…"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  disabled={submitting}
                />
                <div className="lbv2-review-actions">
                  <button
                    type="button"
                    className="modal-cancel"
                    onClick={() => {
                      setReviewOpen(false);
                      setReviewText("");
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                   <button
                    type="button"
                    className="modal-submit lbv2-reject-btn"
                    disabled={!reviewText.trim() || submitting}
                    onClick={() => handleSubmitReview("reject")}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={13} className="lbv2-spin" />
                        Rejecting…
                      </>
                    ) : (
                      "Reject Entry"
                    )}
                  </button>
                  <button
                    type="button"
                    className="modal-submit"
                    disabled={!reviewText.trim() || submitting}
                    onClick={() => handleSubmitReview("approve")}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={13} className="lbv2-spin" />
                        Approving…
                      </>
                    ) : (
                      "Approve Entry"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
