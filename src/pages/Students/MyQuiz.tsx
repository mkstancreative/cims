import { useState } from "react";
import {
  FileQuestion,
  Lock,
  XCircle,
  Award,
  PlayCircle,
  BookOpen,
  Target,
  HelpCircle,
  CheckCircle,
  Clock,
  ClipboardCheck,
  UserX,
  Archive,
  Hourglass,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  quizSubmitAttempt,
  useMyQuiz,
  useSubmitQuiz,
} from "../../hooks/useQuizzes";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import type {
  MyQuizSessionRef,
  QuizLockCode,
  StudentQuiz,
} from "../../api/types/quiz";
import { SkeletonCard } from "../../components/ui/Skeleton/Skeleton";
import LogbookTargets from "../../components/shared/LogbookTargets/LogbookTargets";
import type { LogbookTargets as LogbookTargetsData } from "../../api/types/logbook";
import "./MyQuiz.css";

/**
 * Copy per lock reason. The quiz opens once the supervisor has submitted the
 * evaluation and the student is marked present in an unlocked sitting —
 * curriculum progress no longer gates it. Branching on `code` rather than
 * message text keeps waiting states apart from failures.
 */
const LOCK_STATES: Record<
  QuizLockCode,
  {
    icon: React.ReactNode;
    tone: "amber" | "accent";
    title: string;
    body: string;
  }
> = {
  EVALUATION_NOT_SUBMITTED: {
    icon: <Hourglass size={30} />,
    tone: "accent",
    title: "Waiting for Your Evaluation",
    body: "Your supervisor hasn't submitted your evaluation yet. Your quiz opens once they have and you've been marked present for your batch's sitting.",
  },
  INTERNSHIP_COMPLETED: {
    icon: <CheckCircle size={30} />,
    tone: "accent",
    title: "Internship Completed",
    body: "Your IT is already completed, so this quiz is closed.",
  },
  NO_SESSION: {
    icon: <Clock size={30} />,
    tone: "accent",
    title: "Waiting for Your Sitting",
    body: "Your quiz sitting hasn't been opened yet. There is nothing for you to do — your supervisor will open it and take attendance when it is time.",
  },
  SESSION_NOT_UNLOCKED: {
    icon: <ClipboardCheck size={30} />,
    tone: "accent",
    title: "Attendance Is Being Taken",
    body: "Your sitting is open and attendance is being taken. The quiz will appear here as soon as it is unlocked.",
  },
  NOT_MARKED_PRESENT: {
    icon: <UserX size={30} />,
    tone: "amber",
    title: "Not Marked Present",
    body: "You were not marked present for this quiz sitting, so the quiz is not open to you. Speak to your supervisor if you were in the room.",
  },
  ALREADY_SUBMITTED: {
    icon: <Award size={30} />,
    tone: "accent",
    title: "Already Submitted",
    body: "You have already taken this quiz. There is one attempt per student.",
  },
  INTERNSHIP_ABANDONED: {
    icon: <Archive size={30} />,
    tone: "accent",
    title: "Internship Closed",
    body: "This internship was closed when your newer one started, so its quiz is no longer available. Your quiz will be on your current internship.",
  },
};

/** Any code this screen doesn't know yet — the server's message says why. */
const UNKNOWN_LOCK = {
  icon: <Lock size={30} />,
  tone: "amber" as const,
  title: "Quiz Locked",
  body: "Your quiz isn't open yet.",
};

/**
 * On the "waiting for your evaluation" lock, say WHO the student is waiting
 * on — themselves, their supervisor's approvals, or the evaluation itself —
 * from the tier's logbook floor. Without it both sides see "waiting on the
 * other".
 */
function WaitingOn({ targets }: { targets?: LogbookTargetsData }) {
  const hasGate =
    targets?.source &&
    (targets.minLogbook > 0 || targets.minLogbookApproved > 0);
  if (!targets || !hasGate) return null;

  if (!targets.reachable) {
    return (
      <div className="mq-waiting">
        <LogbookTargets
          targets={targets}
          title="Logbook requirement"
          unreachableNote="Your batch asks for more logbook subtopics than its curriculum has, so it can't be met yet. Please let your coordinator know."
        />
      </div>
    );
  }

  const step = !targets.minLogbookMet
    ? {
        tone: "amber",
        who: "You",
        text: `Log entries on ${
          targets.minLogbook - targets.submittedSubtopics
        } more curriculum subtopic${
          targets.minLogbook - targets.submittedSubtopics === 1 ? "" : "s"
        } — your supervisor can't evaluate you until you reach ${targets.minLogbook}.`,
        action: true,
      }
    : !targets.minLogbookApprovedMet
      ? {
          tone: "accent",
          who: "Your supervisor",
          text: "You've logged enough subtopics. Your supervisor still needs to approve some of your entries before they can evaluate you.",
          action: false,
        }
      : {
          tone: "accent",
          who: "Your supervisor",
          text: "Your logbook requirement is met. Your supervisor just needs to submit your evaluation.",
          action: false,
        };

  return (
    <div className="mq-waiting">
      <p className={`mq-waiting__who mq-waiting__who--${step.tone}`}>
        <strong>Waiting on: {step.who}</strong>
        <span>{step.text}</span>
      </p>
      <LogbookTargets targets={targets} title="Logbook requirement" />
      {step.action && (
        <Link to="/student/logbook" className="mq-waiting__link">
          Go to my log book →
        </Link>
      )}
    </div>
  );
}

/** The lock code and message on a refused `GET /quizzes/my`, if any. */
function quizErrorLock(
  err: unknown,
): { code: QuizLockCode; message?: string } | null {
  const data = (
    err as { response?: { data?: { code?: string; message?: string } } }
  )?.response?.data;
  if (data?.code === "INTERNSHIP_ABANDONED")
    return { code: "INTERNSHIP_ABANDONED", message: data.message };
  return null;
}

// ─── Locked state ─────────────────────────────────────────────────────────────
function LockedCard({
  code,
  session,
  message,
  logbookTargets,
}: {
  code?: QuizLockCode;
  session?: MyQuizSessionRef | null;
  message?: string;
  logbookTargets?: LogbookTargetsData;
}) {
  const state = (code && LOCK_STATES[code]) || UNKNOWN_LOCK;

  return (
    <div className="mq-center-panel">
      <div className="mq-locked-card">
        <div className={`mq-icon-wrap ${state.tone}`}>{state.icon}</div>
        <h3 className="mq-card-title">{state.title}</h3>
        <p className="mq-card-desc">{message || state.body}</p>

        {session && (
          <p className="mq-session-chip">
            Sitting {session.sitting}
            <StatusBadge status={session.status} />
          </p>
        )}

        {code === "EVALUATION_NOT_SUBMITTED" && (
          <WaitingOn targets={logbookTargets} />
        )}
      </div>
    </div>
  );
}

// ─── Quiz intro / landing card ────────────────────────────────────────────────
function QuizIntroCard({
  quiz,
  onStart,
}: {
  quiz: StudentQuiz;
  onStart: () => void;
}) {
  const questions = quiz.questions ?? [];
  return (
    <div className="mq-center-panel">
      <div className="mq-intro-card">
        {/* Icon */}
        <div className="mq-icon-wrap accent" style={{ marginBottom: 20 }}>
          <FileQuestion size={32} />
        </div>

        <h2 className="mq-intro-title">{quiz.title}</h2>
        {quiz.description && (
          <p className="mq-intro-desc">{quiz.description}</p>
        )}

        {/* Meta grid */}
        <div className="mq-intro-meta-grid">
          <div className="mq-intro-meta-item">
            <HelpCircle size={16} className="mq-intro-meta-icon" />
            <span className="mq-intro-meta-label">Questions</span>
            <span className="mq-intro-meta-value">{questions.length}</span>
          </div>
          <div className="mq-intro-meta-item">
            <Target size={16} className="mq-intro-meta-icon" />
            <span className="mq-intro-meta-label">Pass Mark</span>
            <span className="mq-intro-meta-value">{quiz.passMark}</span>
          </div>
          <div className="mq-intro-meta-item">
            <BookOpen size={16} className="mq-intro-meta-icon" />
            <span className="mq-intro-meta-label">Type</span>
            <span className="mq-intro-meta-value">MCQ</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mq-intro-instructions">
          <p className="mq-intro-instr-title">Before you begin:</p>
          <ul className="mq-intro-instr-list">
            <li>
              <CheckCircle size={13} />
              Answer all questions before submitting
            </li>
            <li>
              <CheckCircle size={13} />
              Each question has one correct answer
            </li>
            <li>
              <CheckCircle size={13} />
              You can change your answer before submitting
            </li>
            <li>
              <CheckCircle size={13} />
              Your result will be shown immediately after submission
            </li>
          </ul>
        </div>

        <button type="button" className="mq-start-btn" onClick={onStart}>
          <PlayCircle size={18} />
          Start Quiz
        </button>
      </div>
    </div>
  );
}

// ─── Result state ─────────────────────────────────────────────────────────────
function ResultCard({ score, passed }: { score: number; passed: boolean }) {
  return (
    <div className="mq-center-panel">
      <div className="mq-result-card">
        <div className={`mq-icon-wrap ${passed ? "primary" : "red"}`}>
          {passed ? <Award size={32} /> : <XCircle size={32} />}
        </div>
        <h3 className="mq-result-title">
          {passed ? "Quiz Passed!" : "Quiz Completed"}
        </h3>
        <p className="mq-result-label">Your score</p>
        <div className={`mq-result-score ${passed ? "passed" : "failed"}`}>
          {score}
        </div>
        <span className={`mq-result-verdict ${passed ? "passed" : "failed"}`}>
          {passed ? "You met the pass mark." : "You did not meet the pass mark."}
        </span>
      </div>
    </div>
  );
}

// ─── Quiz form ────────────────────────────────────────────────────────────────
function QuizForm({ quiz }: { quiz: StudentQuiz }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const {
    mutate: submit,
    isPending,
    data: result,
    error: submitError,
  } = useSubmitQuiz();
  // A duplicate submit (409) still carries the recorded result.
  const priorAttempt = quizSubmitAttempt(submitError);

  const questions = quiz.questions ?? [];
  const allAnswered =
    questions.length > 0 && questions.every((_, i) => answers[i] !== undefined);

  const handleSubmit = () => {
    const payload = {
      answers: questions.map((_, questionIndex) => ({
        questionIndex,
        selectedOptionIndex: answers[questionIndex],
      })),
    };
    submit({ id: quiz._id, payload });
  };

  if (result?.data) {
    return <ResultCard score={result.data.score} passed={result.data.passed} />;
  }
  if (priorAttempt) {
    return (
      <ResultCard score={priorAttempt.score} passed={priorAttempt.passed} />
    );
  }

  return (
    <div className="mq-form-wrap">
      {/* Quiz header */}
      <div className="mq-quiz-header">
        <h3 className="mq-quiz-title">{quiz.title}</h3>
        {quiz.description && (
          <p className="mq-quiz-desc">{quiz.description}</p>
        )}
        <p className="mq-quiz-meta">
          {questions.length} questions · Pass mark: {quiz.passMark}
        </p>
      </div>

      {/* Questions */}
      {questions.map((q, qi) => (
        <div key={q._id ?? qi} className="mq-question-card">
          <p className="mq-question-text">
            <span className="mq-question-num">Q{qi + 1}.</span>
            {q.text}
          </p>
          <div className="mq-options-list">
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              return (
                <label
                  key={oi}
                  className={`mq-option-label${selected ? " selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={`q-${qi}`}
                    checked={selected}
                    onChange={() =>
                      setAnswers((prev) => ({ ...prev, [qi]: oi }))
                    }
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {/* Submit row */}
      <div className="mq-submit-row">
        <span className="mq-answered-count">
          {Object.keys(answers).length}/{questions.length} answered
        </span>
        <button
          type="button"
          className="modal-submit"
          disabled={!allAnswered || isPending}
          onClick={handleSubmit}
        >
          {isPending ? "Submitting…" : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MyQuiz() {
  const { data, isLoading, error } = useMyQuiz();
  const [started, setStarted] = useState(false);

  const quizData = data?.data;
  const errorLock = quizErrorLock(error);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <FileQuestion size={20} />
          </div>
          <div>
            <h2 className="page-title">Assessment Quiz</h2>
            <p className="page-sub">
              Complete your training assessment to finalize your evaluation
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mq-center-panel">
          <SkeletonCard lines={4} className="mq-loading" label="Loading quiz" />
        </div>
      ) : errorLock ? (
        <LockedCard code={errorLock.code} message={errorLock.message} />
      ) : !quizData ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "var(--color-text-muted)",
          }}
        >
          No quiz is available for you at the moment.
        </div>
      ) : quizData.alreadySubmitted ? (
        <ResultCard score={quizData.score ?? 0} passed={quizData.passed ?? false} />
      ) : quizData.locked || !quizData.quiz ? (
        <LockedCard
          code={quizData.code}
          logbookTargets={quizData.logbookTargets}
          session={quizData.session}
          message={quizData.message}
        />
      ) : !started ? (
        <QuizIntroCard quiz={quizData.quiz as StudentQuiz} onStart={() => setStarted(true)} />
      ) : (
        <QuizForm quiz={quizData.quiz as StudentQuiz} />
      )}
    </div>
  );
}
