import { Link } from "react-router-dom";
import { ArrowRight, FileQuestion } from "lucide-react";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { SkeletonCard } from "../../ui/Skeleton/Skeleton";
import { useMyQuizSummary } from "../../../hooks/useQuizzes";
import {
  formatCountdown,
  useQuizCountdown,
} from "../../../hooks/useQuizCountdown";
import type { QuizSummaryState } from "../../../api/types/quiz";
import "./QuizSummaryCard.css";

const STATE_LABEL: Record<QuizSummaryState, string> = {
  available: "Open now",
  locked: "Locked",
  submitted: "Submitted",
  no_quiz: "No quiz yet",
};

/**
 * The student's quiz at a glance, from `GET /quizzes/my/summary` — which
 * never carries the paper, so it's safe here. Leads with `nextStep` (whose
 * move it is) and shows both halves of the final grade, since the grade, not
 * the pass flag, is what matters.
 */
export function QuizSummaryCard() {
  const { data, isLoading, isError } = useMyQuizSummary();
  const summary = data?.data;
  // Batch-wide clock from the sitting's unlock; re-synced by the summary poll.
  const { timed, secondsLeft, expired, durationMinutes } = useQuizCountdown(
    summary?.timer,
  );

  if (isLoading) return <SkeletonCard lines={3} label="Loading your quiz" />;
  // Only 404 (no internship) or 500 — nothing useful to show.
  if (isError || !summary) return null;

  const { state, quiz, attempt, grade, nextStep } = summary;
  // The recorded attempt is the freshest source for the quiz half.
  const quizScore = attempt?.score ?? grade.quizScore;

  return (
    <section className={`qsc qsc--${state}`} aria-label="Assessment quiz">
      <header className="qsc__head">
        <span className="qsc__icon" aria-hidden="true">
          <FileQuestion size={18} />
        </span>
        <div className="qsc__title">
          <span className="qsc__eyebrow">Assessment quiz</span>
          <strong>{quiz?.title ?? "No quiz assigned"}</strong>
          {quiz && (
            <span className="qsc__meta">
              {quiz.totalQuestions} question
              {quiz.totalQuestions === 1 ? "" : "s"} · {quiz.totalPoints} points
              {durationMinutes ? ` · ${durationMinutes} min time limit` : ""}
            </span>
          )}
        </div>
        <StatusBadge status={state} label={STATE_LABEL[state]} />
      </header>

      {/* Whose move it is — the question students actually ask. */}
      <p className="qsc__next">{nextStep}</p>

      {state === "available" && timed && secondsLeft !== null && (
        <p className={`qsc__time${expired || secondsLeft <= 300 ? " is-low" : ""}`}>
          {expired ? (
            "The time for this sitting has run out."
          ) : (
            <>
              Time left: <strong>{formatCountdown(secondsLeft)}</strong>
            </>
          )}
        </p>
      )}

      {/* The final grade, spelled out: what each number is and where it
          comes from, so "66" never appears without context. */}
      <div className="qsc__grade-wrap">
        <p className="qsc__grade-head">
          <strong>Your final grade</strong>
          <span>
            Made up of two parts: your supervisor&apos;s evaluation and your
            quiz score.
          </span>
        </p>
        <dl className="qsc__grade">
          <div>
            <dt>Supervisor evaluation</dt>
            <dd>
              {grade.supervisorScore !== null ? (
                <>
                  {grade.supervisorScore}
                  <small>/100</small>
                </>
              ) : (
                <em>Not submitted yet</em>
              )}
            </dd>
            <span className="qsc__cap">
              {grade.evaluationSubmitted
                ? "Scored by your supervisor"
                : "Your supervisor scores this"}
            </span>
          </div>
          <div>
            <dt>Quiz score</dt>
            <dd>
              {quizScore != null ? (
                <>
                  {quizScore}
                  <small>/100</small>
                </>
              ) : (
                <em>Not taken yet</em>
              )}
            </dd>
            <span className="qsc__cap">
              {quizScore != null
                ? "From your quiz"
                : state === "available"
                  ? "Take the quiz to add this"
                  : "Added when you sit the quiz"}
            </span>
          </div>
          <div className="qsc__grade-final">
            <dt>Final grade</dt>
            <dd>
              {grade.finalScore !== null ? (
                <>
                  {grade.finalScore}
                  <small>/100</small>
                  {grade.finalGrade && (
                    <span className="qsc__letter">{grade.finalGrade}</span>
                  )}
                </>
              ) : (
                <em>Pending</em>
              )}
            </dd>
            <span className="qsc__cap">
              {grade.finalScore !== null
                ? "Your overall result"
                : "Calculated once both parts are in"}
            </span>
          </div>
        </dl>
      </div>

      {state === "submitted" && attempt && (
        <p className="qsc__foot">
          Sat on {new Date(attempt.submittedAt).toLocaleDateString()} ·{" "}
          {attempt.answered} answered
        </p>
      )}

      {(state === "available" || state === "locked") && (
        <Link to="/student/quiz" className="qsc__cta">
          {state === "available" ? "Take the quiz" : "View quiz status"}
          <ArrowRight size={14} />
        </Link>
      )}
    </section>
  );
}
