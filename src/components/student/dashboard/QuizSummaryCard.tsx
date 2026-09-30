import { Link } from "react-router-dom";
import { ArrowRight, FileQuestion } from "lucide-react";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { SkeletonCard } from "../../ui/Skeleton/Skeleton";
import { useMyQuizSummary } from "../../../hooks/useQuizzes";
import type { QuizSummaryState } from "../../../api/types/quiz";
import "./QuizSummaryCard.css";

const STATE_LABEL: Record<QuizSummaryState, string> = {
  available: "Open now",
  locked: "Locked",
  submitted: "Submitted",
  no_quiz: "No quiz yet",
};

/** "—" for scores that haven't landed yet. */
const score = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : String(n);

/**
 * The student's quiz at a glance, from `GET /quizzes/my/summary` — which
 * never carries the paper, so it's safe here. Leads with `nextStep` (whose
 * move it is) and shows both halves of the final grade, since the grade, not
 * the pass flag, is what matters.
 */
export function QuizSummaryCard() {
  const { data, isLoading, isError } = useMyQuizSummary();
  const summary = data?.data;

  if (isLoading) return <SkeletonCard lines={3} label="Loading your quiz" />;
  // Only 404 (no internship) or 500 — nothing useful to show.
  if (isError || !summary) return null;

  const { state, quiz, attempt, grade, nextStep } = summary;

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
            </span>
          )}
        </div>
        <StatusBadge status={state} label={STATE_LABEL[state]} />
      </header>

      {/* Whose move it is — the question students actually ask. */}
      <p className="qsc__next">{nextStep}</p>

      {/* Both halves of the final grade. */}
      <dl className="qsc__grade">
        <div>
          <dt>Supervisor</dt>
          <dd>{score(grade.supervisorScore)}</dd>
        </div>
        <div>
          <dt>Quiz</dt>
          <dd>{score(attempt?.score ?? grade.quizScore)}</dd>
        </div>
        <div>
          <dt>Final</dt>
          <dd>
            {score(grade.finalScore)}
            {grade.finalGrade && (
              <span className="qsc__letter">{grade.finalGrade}</span>
            )}
          </dd>
        </div>
      </dl>

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
