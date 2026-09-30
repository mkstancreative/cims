import { useState } from "react";
import {
  Award,
  Loader2,
  SlidersHorizontal,
  MessageSquare,
  ShieldAlert,
  XCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import CustomModal from "../../ui/CustomModal/CustomModal";
import { SkeletonLines } from "../../ui/Skeleton/Skeleton";
import {
  evaluationSubmitError,
  useEvaluationVerify,
  useSubmitEvaluation,
} from "../../../hooks/useEvaluations";
import { formatDate } from "../../../helpers/utilities";
import type {
  EvaluationNotice,
  EvaluationRatings,
  EvaluationVerifyReport,
} from "../../../api/types/evaluation";

// ─── Rating slider ──────────────────────────────────────────────────────────

const RATING_MAX = 25;

interface RatingSliderProps {
  label: string;
  description: string;
  field: keyof EvaluationRatings;
  value: number;
  onChange: (field: keyof EvaluationRatings, val: number) => void;
  disabled?: boolean;
}

function RatingSlider({
  label,
  description,
  field,
  value,
  onChange,
  disabled,
}: RatingSliderProps) {
  const pct = Math.round((value / RATING_MAX) * 100);
  const color =
    pct >= 80 ? "var(--color-primary)" : pct >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="sef-rating-row">
      <div className="sef-rating-header">
        <div>
          <span className="sef-rating-label">{label}</span>
          <span className="sef-rating-desc">{description}</span>
        </div>
        <span className="sef-rating-score" style={{ color }}>
          {value}
          <span className="sef-rating-max">/{RATING_MAX}</span>
        </span>
      </div>
      <div className="sef-slider-wrap">
        <input
          type="range"
          min={0}
          max={RATING_MAX}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(field, Number(e.target.value))}
          className="sef-slider"
          style={{ "--pct": `${pct}%`, "--clr": color } as React.CSSProperties}
        />
        <div className="sef-slider-labels">
          <span>0</span>
          <span>{RATING_MAX / 2}</span>
          <span>{RATING_MAX}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

interface SubmitEvaluationFormProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  /** Evaluate this internship rather than the student's current one. */
  internshipId?: string;
  onSuccess?: () => void;
}

/** True when the preflight refused with a real answer (it carries a `code`). */
function isPreflightRefusal(err: unknown): boolean {
  return Boolean(err && evaluationSubmitError(err)?.code);
}

// ─── Preflight panel ─────────────────────────────────────────────────────────

/** Tone and headline per notice — two of them need someone to act. */
const NOTICE_META: Record<
  string,
  { tone: "amber" | "teal" | "grey" | "green"; title: string }
> = {
  ALREADY_SUBMITTED: { tone: "amber", title: "Already submitted" },
  NO_QUIZ_ASSIGNED: { tone: "amber", title: "Needs a coordinator" },
  WILL_FINALIZE: { tone: "green", title: "This will finalize the grade" },
  QUIZ_NOT_SCORED: { tone: "teal", title: "Waiting on the quiz" },
  INTERNSHIP_NOT_STARTED: { tone: "grey", title: "Internship not started" },
};

function NoticeAlert({ notice }: { notice: EvaluationNotice }) {
  const meta = NOTICE_META[notice.code] ?? { tone: "grey", title: "Note" };
  const Icon =
    meta.tone === "amber"
      ? AlertTriangle
      : meta.tone === "green"
        ? CheckCircle2
        : Info;
  return (
    <div className={`sef-alert sef-alert--${meta.tone}`}>
      <Icon size={16} />
      <div>
        <strong>{meta.title}</strong>
        <p>
          {notice.code === "ALREADY_SUBMITTED"
            ? `Submitting again overwrites your earlier ratings and comments${
                notice.data?.submittedAt
                  ? ` (submitted ${formatDate(notice.data.submittedAt)})`
                  : ""
              }.`
            : notice.message}
        </p>
      </div>
    </div>
  );
}

/** Everything a submit would hit, shown before the supervisor fills anything. */
function PreflightPanel({ report }: { report: EvaluationVerifyReport }) {
  const { verdict, blockers, confirmations, notices, context } = report;
  return (
    <div className="sef-checks">
      {verdict === "blocked" && (
        <div className="sef-alert sef-alert--red" role="alert">
          <XCircle size={16} />
          <div>
            <strong>This evaluation can't be submitted</strong>
            {blockers.length === 1 ? (
              <p>{blockers[0].message}</p>
            ) : (
              <ul>
                {blockers.map((b) => (
                  <li key={b.code}>{b.message}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Drive this off confirmWith, not confirmations — when blocked there's
          nothing to confirm even if a judgement call also applies. */}
      {verdict === "needs_confirmation" && report.confirmWith.length > 0 && (
        <div
          className={`sef-alert ${
            confirmations.some((c) => c.forfeitsFinalGrade)
              ? "sef-alert--red"
              : "sef-alert--amber"
          }`}
        >
          <ShieldAlert size={16} />
          <div>
            <strong>Needs your confirmation</strong>
            <p>
              {confirmations.map((c) => c.message).join(" ")} You'll be asked to
              confirm before it's submitted.
            </p>
          </div>
        </div>
      )}

      {notices.map((n) => (
        <NoticeAlert key={n.code} notice={n} />
      ))}

      {verdict === "ready" && notices.length === 0 && (
        <div className="sef-alert sef-alert--green">
          <CheckCircle2 size={16} />
          <div>
            <strong>Ready to submit</strong>
            <p>
              Curriculum {context.curriculum.approvedSubtopics}/
              {context.curriculum.totalSubtopics} approved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Confirmation step ───────────────────────────────────────────────────────

/**
 * The irreversible part. Shows each consequence verbatim; when it forfeits
 * the final grade the step turns red and names what's abandoned. Each
 * acknowledgement flag is its own checkbox — never a default-focused OK.
 */
function ConfirmStep({
  report,
  acked,
  onAck,
  allAcked,
  severe,
  busy,
  onBack,
  onConfirm,
}: {
  report: EvaluationVerifyReport;
  acked: Record<string, boolean>;
  onAck: (flag: string, value: boolean) => void;
  allAcked: boolean;
  severe: boolean;
  busy: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const { curriculum, student } = report.context;
  return (
    <div className="sef-confirm">
      {report.confirmations.map((c) => (
        <section
          key={c.code}
          className={`sef-conseq${c.forfeitsFinalGrade ? " sef-conseq--severe" : ""}`}
        >
          <p className="sef-conseq__head">
            <ShieldAlert size={16} />
            {c.forfeitsFinalGrade
              ? "This permanently forfeits the final grade"
              : "This can't be undone"}
          </p>
          <p className="sef-conseq__msg">{c.message}</p>
          <p className="sef-conseq__text">{c.consequence}</p>
          {c.code === "CURRICULUM_INCOMPLETE" && (
            <div className="sef-conseq__stats">
              <span>
                Curriculum: <strong>{curriculum.percent}%</strong> (
                {curriculum.approvedSubtopics}/{curriculum.totalSubtopics})
              </span>
              <span>
                Never approvable:{" "}
                <strong>
                  {curriculum.remainingSubtopics} subtopic
                  {curriculum.remainingSubtopics === 1 ? "" : "s"}
                </strong>
              </span>
            </div>
          )}
        </section>
      ))}

      {report.notices
        .filter(
          (n) =>
            n.code === "ALREADY_SUBMITTED" || n.code === "NO_QUIZ_ASSIGNED",
        )
        .map((n) => (
          <NoticeAlert key={n.code} notice={n} />
        ))}

      {report.confirmWith.map((flag) => {
        const c = report.confirmations.find((x) => x.acknowledge === flag);
        return (
          <label key={flag} className="sef-ack">
            <input
              type="checkbox"
              checked={Boolean(acked[flag])}
              onChange={(e) => onAck(flag, e.target.checked)}
              disabled={busy}
            />
            <span>
              {c?.forfeitsFinalGrade
                ? `I understand that ${student.name ?? "this student"} will never receive a final grade for this internship, and I want to submit anyway.`
                : "I understand this can't be undone, and I want to submit anyway."}
            </span>
          </label>
        );
      })}

      <div className="modal-actions">
        <button
          type="button"
          className="modal-cancel"
          onClick={onBack}
          disabled={busy}
        >
          Back
        </button>
        <button
          type="button"
          className={`modal-submit${severe ? " sef-danger" : ""}`}
          disabled={!allAcked || busy}
          onClick={onConfirm}
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          {busy ? (
            <>
              <Loader2
                size={13}
                style={{ animation: "spin .8s linear infinite" }}
              />
              Submitting…
            </>
          ) : (
            <>
              <ShieldAlert size={13} /> Submit anyway
            </>
          )}
        </button>
      </div>
    </div>
  );
}

const DEFAULT_RATINGS: EvaluationRatings = {
  professionalism: 15,
  technicalCompetence: 15,
  communication: 15,
  initiative: 15,
};

const RATING_FIELDS: Array<{
  field: keyof EvaluationRatings;
  label: string;
  description: string;
}> = [
  {
    field: "professionalism",
    label: "Professionalism",
    description: "Conduct, punctuality, and workplace attitude",
  },
  {
    field: "technicalCompetence",
    label: "Technical Competence",
    description: "Practical skills and task execution",
  },
  {
    field: "communication",
    label: "Communication",
    description: "Clarity, collaboration, and reporting",
  },
  {
    field: "initiative",
    label: "Initiative",
    description: "Proactivity, problem-solving, and drive",
  },
];

export default function SubmitEvaluationForm({
  isOpen,
  onClose,
  studentId,
  studentName,
  internshipId,
  onSuccess,
}: SubmitEvaluationFormProps) {
  const [ratings, setRatings] = useState<EvaluationRatings>(DEFAULT_RATINGS);
  const [comments, setComments] = useState("");
  /** "form" = ratings; "confirm" = the irreversible-consequence step. */
  const [step, setStep] = useState<"form" | "confirm">("form");
  /** Acknowledgement flags the supervisor has ticked. */
  const [acked, setAcked] = useState<Record<string, boolean>>({});
  const [checking, setChecking] = useState(false);

  const verifyParams = internshipId ? { internshipId } : undefined;
  const {
    data: verifyData,
    isLoading: verifying,
    error: verifyError,
    refetch: reverify,
  } = useEvaluationVerify(studentId, verifyParams, isOpen);
  const report = verifyData?.data;

  const { mutate: submit, isPending } = useSubmitEvaluation();
  const busy = isPending || checking;

  const totalScore =
    ratings.professionalism +
    ratings.technicalCompetence +
    ratings.communication +
    ratings.initiative;

  const handleChange = (field: keyof EvaluationRatings, val: number) => {
    setRatings((prev) => ({ ...prev, [field]: val }));
  };

  const resetForm = () => {
    setRatings(DEFAULT_RATINGS);
    setComments("");
    setStep("form");
    setAcked({});
  };

  const send = (flags: Record<string, true>) =>
    submit(
      {
        studentId,
        payload: {
          ratings,
          comments: comments.trim() || undefined,
          ...flags,
        },
      },
      {
        onSuccess: () => {
          resetForm();
          onSuccess?.();
        },
        onError: async (err) => {
          // The preflight is a snapshot, not a lock: a gate can close between
          // the two calls. Re-verify and show whatever is in the way now.
          const refusal = evaluationSubmitError(err);
          const fresh = (await reverify()).data?.data;
          if (
            refusal?.requiresConfirmation &&
            fresh?.verdict === "needs_confirmation"
          ) {
            setAcked({});
            setStep("confirm");
          } else {
            setStep("form");
            // The hook stays quiet on confirmation refusals; if there's no
            // report to confirm against, say why it was refused.
            if (refusal?.requiresConfirmation) toast.error(refusal.message);
          }
        },
      },
    );

  // Submit re-runs the preflight first — curriculum progress and quiz scores
  // move while the form is open.
  const handleSubmit = async () => {
    setChecking(true);
    const result = await reverify();
    setChecking(false);
    const fresh = result.data?.data;
    if (!fresh) {
      // A coded refusal (not your student, bad id…) is shown in the panel.
      // Anything else means the preflight isn't available — submit the old
      // way; a refused POST is still handled.
      if (!isPreflightRefusal(result.error)) send({});
      return;
    }
    if (fresh.verdict === "blocked") return; // the panel lists why
    if (fresh.verdict === "needs_confirmation") {
      setAcked({});
      setStep("confirm");
      return;
    }
    send({});
  };

  // Every flag in confirmWith must be ticked, and only those are sent.
  const confirmWith = report?.confirmWith ?? [];
  const allAcked = confirmWith.length > 0 && confirmWith.every((f) => acked[f]);
  const handleConfirmedSubmit = () => {
    if (!allAcked) return;
    send(Object.fromEntries(confirmWith.map((f) => [f, true as const])));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const verdict = report?.verdict;
  const blocked = verdict === "blocked";
  // Only a coded answer blocks. A missing route, network or server error means
  // the preflight isn't available, so the form falls back to plain submit.
  const verifyFailed = !report && isPreflightRefusal(verifyError);
  const submitDisabled = busy || verifying || blocked || verifyFailed;
  const severe = (report?.confirmations ?? []).some(
    (c) => c.forfeitsFinalGrade,
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === "confirm" ? "Confirm Evaluation" : "Submit Evaluation"}
      subtitle={studentName}
      icon={
        step === "confirm" ? <ShieldAlert size={16} /> : <Award size={16} />
      }
      size="medium"
    >
      {step === "confirm" && report ? (
        <ConfirmStep
          report={report}
          acked={acked}
          onAck={(flag, v) => setAcked((a) => ({ ...a, [flag]: v }))}
          allAcked={allAcked}
          severe={severe}
          busy={busy}
          onBack={() => setStep("form")}
          onConfirm={handleConfirmedSubmit}
        />
      ) : (
        <div className="sef-form">
          {/* Preflight — every gate a submit would hit, up front */}
          {verifying ? (
            <div className="sef-preflight">
              <SkeletonLines lines={2} label="Checking this evaluation" />
            </div>
          ) : verifyFailed ? (
            <div className="sef-alert sef-alert--red" role="alert">
              <XCircle size={16} />
              <div>
                <strong>This evaluation can't be submitted</strong>
                <p>
                  {evaluationSubmitError(verifyError)?.message ??
                    "We couldn't check this evaluation. Close and try again."}
                </p>
              </div>
            </div>
          ) : report ? (
            <PreflightPanel report={report} />
          ) : null}

          {/* Total score preview */}
          <div className="sef-score-preview">
            <SlidersHorizontal size={14} />
            <span>Total score preview:</span>
            <strong className="sef-total-score">{totalScore} / 100</strong>
          </div>

          {/* Rating sliders */}
          <div className="sef-ratings">
            {RATING_FIELDS.map((f) => (
              <RatingSlider
                key={f.field}
                label={f.label}
                description={f.description}
                field={f.field}
                value={ratings[f.field]}
                onChange={handleChange}
                disabled={isPending}
              />
            ))}
          </div>

          {/* Comments */}
          <div className="form-group">
            <label className="modal-label">
              <MessageSquare
                size={12}
                style={{ display: "inline", marginRight: 4 }}
              />
              Supervisor Comments
            </label>
            <textarea
              className="modal-input"
              rows={4}
              placeholder="Describe your overall assessment of the student's performance…"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-cancel"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="modal-submit"
              disabled={submitDisabled}
              onClick={handleSubmit}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              {busy ? (
                <>
                  <Loader2
                    size={13}
                    style={{ animation: "spin .8s linear infinite" }}
                  />
                  {checking ? "Checking…" : "Submitting…"}
                </>
              ) : verdict === "needs_confirmation" ? (
                <>
                  <ShieldAlert size={13} /> Review & Submit
                </>
              ) : (
                <>
                  <Award size={13} /> Submit Evaluation
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .sef-form{display:flex;flex-direction:column;gap:20px}
        .sef-score-preview{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--color-text-secondary);padding:10px 14px;background:var(--color-bg-secondary);border:1px solid var(--color-border);border-radius:10px}
        .sef-total-score{font-size:18px;color:var(--color-accent);margin-left:auto}
        .sef-ratings{display:flex;flex-direction:column;gap:16px}
        .sef-rating-row{display:flex;flex-direction:column;gap:8px;padding:14px;border:1px solid var(--color-border);border-radius:12px;background:var(--color-bg-secondary);box-shadow:0 1px 4px rgba(0,0,0,.04)}
        [data-theme="dark"] .sef-rating-row{background:var(--color-bg-primary);box-shadow:none}
        .sef-rating-header{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
        .sef-rating-label{display:block;font-size:13px;font-weight:700;color:var(--color-text-primary)}
        .sef-rating-desc{display:block;font-size:11.5px;color:var(--color-text-secondary);margin-top:2px}
        .sef-rating-score{font-size:22px;font-weight:700;white-space:nowrap;flex-shrink:0;transition:color .2s}
        .sef-rating-max{font-size:13px;font-weight:500;opacity:.6}
        .sef-slider-wrap{display:flex;flex-direction:column;gap:4px}
        .sef-slider{width:100%;-webkit-appearance:none;height:6px;border-radius:20px;background:linear-gradient(to right,var(--clr) var(--pct),var(--color-border) var(--pct));outline:none;cursor:pointer}
        .sef-slider:disabled{opacity:.5;cursor:not-allowed}
        .sef-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--clr);box-shadow:0 1px 6px rgba(0,0,0,.2);cursor:pointer;transition:transform .15s}
        .sef-slider::-webkit-slider-thumb:hover{transform:scale(1.15)}
        .sef-slider-labels{display:flex;justify-content:space-between;font-size:10.5px;color:var(--color-text-secondary)}
        .sef-preflight{border:1px solid var(--color-border);border-radius:12px;background:var(--color-bg-secondary)}
        .sef-checks{display:flex;flex-direction:column;gap:10px}
        .sef-alert{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:12px;border:1px solid rgba(var(--sef-rgb),.3);border-left:4px solid rgb(var(--sef-rgb));background:rgba(var(--sef-rgb),.08);font-size:13px;line-height:1.5;color:var(--color-text-secondary)}
        .sef-alert>svg{flex-shrink:0;margin-top:2px;color:rgb(var(--sef-rgb))}
        .sef-alert strong{display:block;color:var(--color-text-primary);font-size:13.5px}
        .sef-alert p{margin:2px 0 0}
        .sef-alert ul{margin:6px 0 0;padding-left:18px}
        .sef-alert--red{--sef-rgb:220,38,38}
        .sef-alert--amber{--sef-rgb:202,138,4}
        .sef-alert--teal{--sef-rgb:13,148,136}
        .sef-alert--grey{--sef-rgb:100,116,139}
        .sef-alert--green{--sef-rgb:22,163,74}
        .sef-confirm{display:flex;flex-direction:column;gap:16px}
        .sef-conseq{padding:14px 16px;border-radius:12px;border:1px solid rgba(var(--sef-rgb),.35);background:rgba(var(--sef-rgb),.07);--sef-rgb:202,138,4}
        .sef-conseq--severe{--sef-rgb:220,38,38;border-width:1.5px}
        .sef-conseq__head{display:flex;align-items:center;gap:8px;margin:0 0 8px;font-size:14px;font-weight:700;color:rgb(var(--sef-rgb))}
        .sef-conseq__msg{margin:0 0 8px;font-size:13px;color:var(--color-text-secondary);line-height:1.5}
        .sef-conseq__text{margin:0;font-size:13.5px;font-weight:600;line-height:1.55;color:var(--color-text-primary)}
        .sef-conseq__stats{display:flex;flex-wrap:wrap;gap:8px 16px;margin-top:10px;font-size:12.5px;color:var(--color-text-secondary)}
        .sef-conseq__stats strong{color:var(--color-text-primary)}
        .sef-ack{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-bg-secondary);font-size:13px;line-height:1.5;color:var(--color-text-primary);cursor:pointer}
        .sef-ack input{flex-shrink:0;width:17px;height:17px;margin:2px 0 0;accent-color:#dc2626;cursor:pointer}
        .modal-submit.sef-danger{background:#dc2626;border-color:#dc2626}
        .modal-submit.sef-danger:hover:not(:disabled){background:#b91c1c}
        [data-theme="dark"] .sef-alert--amber,[data-theme="dark"] .sef-conseq{--sef-rgb:250,204,21}
        [data-theme="dark"] .sef-alert--red,[data-theme="dark"] .sef-conseq--severe{--sef-rgb:248,113,113}
      `}</style>
    </CustomModal>
  );
}
