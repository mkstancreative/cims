import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  MessageSquare,
  Target,
  UserCheck,
} from "lucide-react";
import { useMyEvaluation } from "../../hooks/useEvaluations";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import { GradeBadge } from "../../components/shared/dashboard/DashboardKit";
import { SkeletonCards } from "../../components/ui/Skeleton/Skeleton";
import { formatDate } from "../../helpers/utilities";
import type { MyEvaluation as MyEvaluationData } from "../../api/types/evaluation";
import "./MyEvaluation.css";

const STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting supervisor",
  "awaiting-quiz": "Awaiting quiz",
  completed: "Completed",
};

// ─── Status + final result ────────────────────────────────────────────────────
function StatusCard({ ev }: { ev: MyEvaluationData }) {
  const { finalGrade } = ev;
  return (
    <section className={`mev-card mev-status mev-status--${ev.status}`}>
      <div className="mev-status__main">
        <StatusBadge
          status={ev.status}
          label={STATUS_LABEL[ev.status] ?? undefined}
        />
        {/* Server-written: what's outstanding and whose move it is. */}
        <p className="mev-status__next">{ev.nextStep}</p>
        {ev.batch && (
          <p className="mev-status__batch">
            {ev.batch.name} · {ev.batch.session}
          </p>
        )}
      </div>
      {finalGrade.available && finalGrade.score !== null && (
        <div className="mev-status__result">
          <span className="mev-status__result-label">Final result</span>
          <span className="mev-status__result-score">
            {finalGrade.score}
            <small>/100</small>
          </span>
          {finalGrade.grade && <GradeBadge grade={finalGrade.grade} />}
        </div>
      )}
    </section>
  );
}

// ─── What they still need on the quiz ─────────────────────────────────────────
function ProjectionCard({
  projection,
}: {
  projection: NonNullable<MyEvaluationData["projection"]>;
}) {
  return (
    <section className="mev-card mev-projection">
      <h3 className="mev-card__title">
        <Target size={16} /> What you need on the quiz
      </h3>
      <p className="mev-card__sub">
        Based on {projection.basedOn}. The lowest quiz score that reaches each
        grade:
      </p>
      <ul className="mev-targets">
        {projection.quizScoreNeededFor.map((t) => (
          <li
            key={t.grade}
            className={`mev-target${
              t.guaranteed ? " is-secured" : !t.reachable ? " is-out" : ""
            }`}
          >
            <span className="mev-target__grade">{t.grade}</span>
            <span className="mev-target__need">
              {t.guaranteed ? (
                <>
                  <CheckCircle2 size={14} /> Already achieved
                </>
              ) : !t.reachable ? (
                "Out of reach"
              ) : (
                <>
                  <small>Score at least</small>
                  <strong>{t.quizScore}</strong>
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── How the final grade is made ──────────────────────────────────────────────
function CompositionCard({ ev }: { ev: MyEvaluationData }) {
  const { finalGrade } = ev;
  return (
    <section className="mev-card">
      <h3 className="mev-card__title">How your final grade is worked out</h3>
      <p className="mev-card__sub">{finalGrade.formula}</p>
      <ul className="mev-parts">
        {finalGrade.components.map((c) => (
          <li key={c.label} className={`mev-part${c.received ? " is-in" : ""}`}>
            <span className="mev-part__label">
              {c.label}
              <small>{c.weightPercent}% of your grade</small>
            </span>
            <span className="mev-part__value">
              {c.received && c.score !== null ? (
                <>
                  {c.score}
                  <small>/100</small>
                </>
              ) : (
                <em>
                  <Clock size={13} /> Not in yet
                </em>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Supervisor's assessment, criterion by criterion ─────────────────────────
function AssessmentCard({ ev }: { ev: MyEvaluationData }) {
  const a = ev.supervisorAssessment;
  return (
    <section className="mev-card">
      <div className="mev-card__head">
        <h3 className="mev-card__title">
          <UserCheck size={16} /> Supervisor assessment
        </h3>
        <span className="mev-card__score">
          {a.score !== null ? (
            <>
              {a.score}
              <small>/{a.maxScore}</small>
            </>
          ) : (
            <em>Not submitted yet</em>
          )}
        </span>
      </div>
      {a.submitted && (
        <p className="mev-card__sub">
          {a.assessedBy ? `By ${a.assessedBy}` : "By your supervisor"}
          {a.submittedAt ? ` · ${formatDate(a.submittedAt)}` : ""}
        </p>
      )}

      {/* From the server's rubric — criteria can change without a client
          release. A null score is "not assessed", never zero. */}
      <ul className="mev-rubric">
        {a.breakdown.map((c) => (
          <li key={c.key} className="mev-crit">
            <div className="mev-crit__row">
              <span>{c.label}</span>
              {c.score !== null ? (
                <strong>
                  {c.score}
                  <small>/{c.max}</small>
                </strong>
              ) : (
                <em>Not assessed</em>
              )}
            </div>
            <div
              className={`mev-crit__track${c.score === null ? " is-empty" : ""}`}
              role={c.score !== null ? "progressbar" : undefined}
              aria-label={c.score !== null ? c.label : undefined}
              aria-valuenow={c.score ?? undefined}
              aria-valuemin={c.score !== null ? 0 : undefined}
              aria-valuemax={c.score !== null ? c.max : undefined}
            >
              {c.percent !== null && (
                <span style={{ width: `${c.percent}%` }} />
              )}
            </div>
          </li>
        ))}
      </ul>

      {a.comments && (
        <div className="mev-comments">
          <p className="mev-comments__head">
            <MessageSquare size={14} /> Comments
          </p>
          <p className="mev-comments__text">{a.comments}</p>
        </div>
      )}
    </section>
  );
}

// ─── Grade scale ──────────────────────────────────────────────────────────────
function GradeScale({ ev }: { ev: MyEvaluationData }) {
  const current = ev.finalGrade.available ? ev.finalGrade.grade : null;
  return (
    <section className="mev-card">
      <h3 className="mev-card__title">Grade scale</h3>
      <ul className="mev-scale">
        {ev.gradeScale.map((g) => (
          <li
            key={g.grade}
            className={`mev-scale__item${g.grade === current ? " is-current" : ""}`}
            aria-current={g.grade === current ? "true" : undefined}
          >
            <strong>{g.grade}</strong>
            <span>
              {g.minScore > 0
                ? `${g.minScore}+`
                : `below ${nextMin(ev, g.grade)}`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The lowest band's upper edge — the next grade's minimum. */
function nextMin(ev: MyEvaluationData, grade: string): number {
  const i = ev.gradeScale.findIndex((g) => g.grade === grade);
  return ev.gradeScale[i - 1]?.minScore ?? 0;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
/**
 * One internship's evaluation, reached from My Internships →
 * `/student/internships/:internshipId/evaluation?batchId=…`. Both ids go to
 * the API so the right internship is shown, not just the current one.
 */
export default function MyEvaluation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { internshipId } = useParams<{ internshipId: string }>();
  const [searchParams] = useSearchParams();
  const batchId = searchParams.get("batchId") ?? undefined;

  const { data, isLoading, isError, error } = useMyEvaluation({
    ...(internshipId && { internshipId }),
    ...(batchId && { batchId }),
  });
  const ev = data?.data;
  // The server's own message (e.g. no internship resolves) is safe to show.
  const errorMessage = (
    error as { response?: { data?: { message?: string } } } | null
  )?.response?.data?.message;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <ClipboardCheck size={20} />
          </div>
          <div>
            <h2 className="page-title">Internship Evaluation</h2>
            <p className="page-sub">
              {ev?.batch
                ? `${ev.batch.name} · ${ev.batch.session} — your supervisor's assessment, your quiz, and your final grade`
                : "Your supervisor's assessment, your quiz, and your final grade"}
            </p>
          </div>
        </div>
        <div className="page-header-right">
          <button
            type="button"
            className="dash-btn dash-btn--ghost"
            // Back to wherever they came from (My Internships, or that
            // internship's logbooks); opened directly, to My Internships.
            onClick={() =>
              location.key !== "default"
                ? navigate(-1)
                : navigate("/student/internships")
            }
          >
            <ArrowLeft size={15} /> Back
          </button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonCards cards={3} lines={3} label="Loading evaluation" />
      ) : isError || !ev ? (
        <div className="mev-card mev-empty">
          <ClipboardCheck size={36} />
          <p>
            {errorMessage ??
              "We couldn't load this evaluation. Please try again later."}
          </p>
        </div>
      ) : (
        <div className="mev-layout">
          <div className="mev-main">
            <StatusCard ev={ev} />
            {/* Most actionable while waiting on the quiz. */}
            {ev.status === "awaiting-quiz" && ev.projection && (
              <ProjectionCard projection={ev.projection} />
            )}
            <AssessmentCard ev={ev} />
          </div>
          <aside className="mev-side">
            <CompositionCard ev={ev} />
            <GradeScale ev={ev} />
          </aside>
        </div>
      )}
    </div>
  );
}
