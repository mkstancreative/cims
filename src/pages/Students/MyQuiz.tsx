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
} from "lucide-react";
import { useMyQuiz, useSubmitQuiz } from "../../hooks/useQuizzes";
import Spinner from "../../components/ui/Spinner/Spinner";
import type {
  MyQuizCurriculumProgress,
  MyQuizSessionRef,
  QuizLockCode,
  StudentQuiz,
} from "../../api/types/quiz";
import "./MyQuiz.css";

/**
 * Copy per lock reason. A student must clear three gates: curriculum
 * complete, a sitting unlocked, and marked present. Branching on `code`
 * rather than message text is what makes these distinguishable — several are
 * waiting states, not failures.
 */
const LOCK_STATES: Record<
  QuizLockCode,
  {
    icon: React.ReactNode;
    tone: "amber" | "accent";
    title: string;
    body: string;
    showProgress: boolean;
  }
> = {
  CURRICULUM_INCOMPLETE: {
    icon: <Lock size={30} />,
    tone: "amber",
    title: "Quiz Locked",
    body: "You need to complete more of your curriculum before the quiz unlocks. Keep working through your approved subtopics.",
    showProgress: true,
  },
  NO_SESSION: {
    icon: <Clock size={30} />,
    tone: "accent",
    title: "Waiting for Your Sitting",
    body: "Your quiz sitting hasn't been opened yet. There is nothing for you to do — your supervisor will open it and take attendance when it is time.",
    showProgress: false,
  },
  SESSION_NOT_UNLOCKED: {
    icon: <ClipboardCheck size={30} />,
    tone: "accent",
    title: "Attendance Is Being Taken",
    body: "Your sitting is open and attendance is being taken. The quiz will appear here as soon as it is unlocked.",
    showProgress: false,
  },
  NOT_MARKED_PRESENT: {
    icon: <UserX size={30} />,
    tone: "amber",
    title: "Not Marked Present",
    body: "You were not marked present for this quiz sitting, so the quiz is not open to you. Speak to your supervisor if you were in the room.",
    showProgress: false,
  },
  ALREADY_SUBMITTED: {
    icon: <Award size={30} />,
    tone: "accent",
    title: "Already Submitted",
    body: "You have already taken this quiz. There is one attempt per student.",
    showProgress: false,
  },
};

// ─── Locked state ─────────────────────────────────────────────────────────────
function LockedCard({
  code,
  curriculum,
  session,
  message,
}: {
  code?: QuizLockCode;
  curriculum?: MyQuizCurriculumProgress;
  session?: MyQuizSessionRef | null;
  message?: string;
}) {
  const percent = curriculum?.percent ?? 0;
  // An unrecognised or absent code falls back to the curriculum copy, which is
  // what the only lock reason used to be.
  const state = LOCK_STATES[code ?? "CURRICULUM_INCOMPLETE"] ??
    LOCK_STATES.CURRICULUM_INCOMPLETE;

  return (
    <div className="mq-center-panel">
      <div className="mq-locked-card">
        <div className={`mq-icon-wrap ${state.tone}`}>{state.icon}</div>
        <h3 className="mq-card-title">{state.title}</h3>
        <p className="mq-card-desc">{message || state.body}</p>

        {session && (
          <p className="mq-session-chip">
            Sitting {session.sitting} · {session.status.replace(/_/g, " ")}
          </p>
        )}

        {state.showProgress && curriculum && (
          <div className="mq-progress-wrap">
            <div className="mq-progress-label">
              <span>Curriculum Progress</span>
              <span>
                {curriculum.approvedSubtopics}/{curriculum.totalSubtopics} approved
              </span>
            </div>
            <div className="mq-progress-track">
              <div
                className="mq-progress-fill"
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <div className="mq-progress-pct">{percent}%</div>
          </div>
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
        <div className={`mq-icon-wrap ${passed ? "purple" : "red"}`}>
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
  const { mutate: submit, isPending, data: result } = useSubmitQuiz();

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
  const { data, isLoading } = useMyQuiz();
  const [started, setStarted] = useState(false);

  const quizData = data?.data;

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
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spinner size={28} color="var(--color-accent)" text="Loading quiz…" />
        </div>
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
          curriculum={quizData.curriculum}
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
