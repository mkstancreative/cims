import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Calendar,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDate } from "../../../helpers/utilities";
import {
  useLogbookDetail,
  useReviewLogbook,
} from "../../../hooks/useSchoolSupervisor";
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="lbv2-section-title">{children}</h4>;
}

function ReflectionBlock({
  label,
  text,
  color,
}: {
  label: string;
  text: string;
  color: "orange" | "green" | "blue";
}) {
  return (
    <div className={`lbv2-reflection reflection-${color}`}>
      <div className="lbv2-reflection-label">{label}</div>
      <div
        className="lbv2-reflection-text"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
}

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

  const { data: response, isLoading } = useLogbookDetail(studentId, logbookId);
  const { mutate: submitReview, isPending: submitting } =
    useReviewLogbook(studentId);

  const [reviewText, setReviewText] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);

  const logbook = response?.data?.logbook;
  const student = response?.data?.student;

  const statusEntry = logbook ? STATUS_META[logbook.status] : null;

  // Review can only be submitted for submitted logbooks
  const canReview = logbook?.status === "submitted";

  const handleSubmitReview = () => {
    if (!reviewText.trim()) return;
    submitReview(
      { logbookId, comments: reviewText },
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
                Week {logbook.weekNumber}
              </div>
              <h2 className="lbv2-title">{logbook.title}</h2>
              <div className="lbv2-meta-row">
                <span className="lbv2-meta-item">
                  <Calendar size={13} />
                  {formatDate(logbook.weekStartDate)} –{" "}
                  {formatDate(logbook.weekEndDate)}
                </span>
                <span className="lbv2-meta-item">
                  <Clock size={13} />
                  {logbook.totalHours} total hours
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

          {/* ── Activities ── */}
          <div className="lbv2-section">
            <SectionTitle>
              Daily Activities ({logbook.activities.length})
            </SectionTitle>
            <div className="lbv2-activities">
              {logbook.activities.map((act, i) => (
                <div key={act._id ?? i} className="lbv2-activity-card">
                  <div className="lbv2-activity-top">
                    <div className="lbv2-activity-left">
                      <span className="lbv2-date-chip">
                        {formatDate(act.date)}
                      </span>
                      <span className="lbv2-activity-name">{act.activity}</span>
                    </div>
                    <span className="lbv2-hours">
                      <Clock size={11} />
                      {act.hoursSpent}h
                    </span>
                  </div>
                  <div
                    className="lbv2-desc"
                    dangerouslySetInnerHTML={{ __html: act.description }}
                  />
                  {act.skillsUsed.length > 0 && (
                    <div className="lbv2-skills">
                      {act.skillsUsed.map((s) => (
                        <span key={s} className="lbv2-skill-chip">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Reflections ── */}
          {(logbook.challengesFaced ||
            logbook.lessonsLearned ||
            logbook.nextWeekPlan) && (
            <div className="lbv2-section">
              <SectionTitle>Weekly Reflections</SectionTitle>
              <div className="lbv2-reflections">
                {logbook.challengesFaced && (
                  <ReflectionBlock
                    label="Challenges Faced"
                    text={logbook.challengesFaced}
                    color="orange"
                  />
                )}
                {logbook.lessonsLearned && (
                  <ReflectionBlock
                    label="Lessons Learned"
                    text={logbook.lessonsLearned}
                    color="green"
                  />
                )}
                {logbook.nextWeekPlan && (
                  <ReflectionBlock
                    label="Next Week's Plan"
                    text={logbook.nextWeekPlan}
                    color="blue"
                  />
                )}
              </div>
            </div>
          )}

          {/* ── School Review ── */}
          {logbook.schoolReview?.comments && (
            <div className="lbv2-section">
              <SectionTitle>School Supervisor's Review</SectionTitle>
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
              <p className="lbv2-review-hint">
                {logbook.status === "approved" ? (
                  <span className="lbv2-approved-note">
                    <CheckCircle2 size={13} /> This logbook has already been
                    approved.
                  </span>
                ) : (
                  `Review is only available for logbooks in "submitted" status. Current status: ${logbook.status}.`
                )}
              </p>
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
                  placeholder="Enter your review comments for this week's logbook…"
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
                    className="modal-submit"
                    disabled={!reviewText.trim() || submitting}
                    onClick={handleSubmitReview}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={13} className="lbv2-spin" />
                        Submitting…
                      </>
                    ) : (
                      "Submit Review"
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
