import { useEffect, useRef, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { Link } from "react-router-dom";
import {
  quizSubmitAttempt,
  useMyQuiz,
  useMyQuizSummary,
  useSubmitQuiz,
} from "../../hooks/useQuizzes";
import { useMyQuizSession } from "../../hooks/useQuizSessions";
import {
  formatCountdown,
  newestTimer,
  useQuizCountdown,
} from "../../hooks/useQuizCountdown";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import type {
  MyQuizSessionRef,
  QuizLockCode,
  QuizTimer,
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
/** What the intro shows — never the paper itself. */
interface QuizIntro {
  title: string;
  description?: string | null;
  totalQuestions?: number;
  passMark?: number;
}

/**
 * The landing card, built only from `/quiz-sessions/my` and
 * `/quizzes/my/summary` — neither carries questions. The paper is fetched
 * when the student presses Start, not before.
 */
function QuizIntroCard({
  intro,
  session,
  timer,
  onStart,
}: {
  intro: QuizIntro;
  session?: { sitting: number; status: string; present?: boolean } | null;
  /** From the summary — no paper. Drives the time left and Start/Resume. */
  timer?: QuizTimer | null;
  onStart: () => void;
}) {
  const { timed, secondsLeft, expired, durationMinutes } =
    useQuizCountdown(timer);
  // The clock runs from unlock either way — resuming grants no fresh time.
  const resuming = Boolean(timer?.startedAt);
  return (
    <div className="mq-center-panel">
      <div className="mq-intro-card">
        {/* Icon */}
        <div className="mq-icon-wrap accent" style={{ marginBottom: 20 }}>
          <FileQuestion size={32} />
        </div>

        <h2 className="mq-intro-title">{intro.title}</h2>
        {intro.description && (
          <p className="mq-intro-desc">{intro.description}</p>
        )}

        {session && (
          <p className="mq-session-chip">
            Sitting {session.sitting}
            <StatusBadge status={session.status} />
            {session.present && (
              <StatusBadge status="present" label="Marked present" />
            )}
          </p>
        )}

        {/* Meta grid */}
        <div className="mq-intro-meta-grid">
          <div className="mq-intro-meta-item">
            <HelpCircle size={16} className="mq-intro-meta-icon" />
            <span className="mq-intro-meta-label">Questions</span>
            <span className="mq-intro-meta-value">
              {intro.totalQuestions ?? "—"}
            </span>
          </div>
          <div className="mq-intro-meta-item">
            <Target size={16} className="mq-intro-meta-icon" />
            <span className="mq-intro-meta-label">Pass Mark</span>
            <span className="mq-intro-meta-value">
              {intro.passMark ?? "—"}
            </span>
          </div>
          <div className="mq-intro-meta-item">
            <Clock size={16} className="mq-intro-meta-icon" />
            <span className="mq-intro-meta-label">Time Limit</span>
            <span className="mq-intro-meta-value">
              {durationMinutes ? `${durationMinutes} min` : "None"}
            </span>
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
              Answer every question you can — unanswered ones score zero
            </li>
            {durationMinutes ? (
              <li>
                <CheckCircle size={13} />
                When time runs out, your answers are submitted automatically
              </li>
            ) : null}
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

        {/* Batch-wide clock: it started when the sitting was unlocked. */}
        {timed && secondsLeft !== null && !expired && (
          <p className="mq-intro-timeleft">
            <Clock size={14} /> Time left for this sitting:{" "}
            <strong>{formatCountdown(secondsLeft)}</strong>
            {resuming && <span> · the clock kept running while you were away</span>}
          </p>
        )}
        {timed && expired && (
          <p className="mq-intro-timeleft mq-intro-timeleft--over">
            <Clock size={14} /> The time for this sitting has run out.
          </p>
        )}

        <button
          type="button"
          className="mq-start-btn"
          onClick={onStart}
          disabled={timed && expired}
        >
          <PlayCircle size={18} />
          {resuming ? "Resume Quiz" : "Start Quiz"}
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
/**
 * In-progress answers live in localStorage, keyed by the signed-in user's id
 * and the quiz — so they survive a reload or a closed tab (the clock keeps
 * running regardless), and one student never sees another's on a shared
 * computer. Keyed on the account id rather than the access token, which is
 * refreshed during a session and would orphan the saved answers.
 */
interface SavedProgress {
  answers: Record<number, number>;
  current: number;
}

const progressKey = (userId: string, quizId: string) =>
  `quiz-progress:${userId}:${quizId}`;

function readProgress(userId: string, quizId: string): SavedProgress {
  try {
    const raw = JSON.parse(
      localStorage.getItem(progressKey(userId, quizId)) ?? "null",
    );
    if (raw && typeof raw === "object" && raw.answers) {
      return { answers: raw.answers, current: Number(raw.current) || 0 };
    }
  } catch {
    // Unreadable or blocked — start fresh.
  }
  return { answers: {}, current: 0 };
}

/** The submit error is past the deadline — too late, never retry. */
function isTimeElapsed(err: unknown): boolean {
  return (
    (err as { response?: { data?: { code?: string } } })?.response?.data
      ?.code === "QUIZ_TIME_ELAPSED"
  );
}

/**
 * The countdown bar — batch-wide, from the sitting's unlock. Amber under five
 * minutes, red under one; a screen reader hears those two moments, not every
 * second.
 */
function QuizTimerBar({
  secondsLeft,
  durationMinutes,
}: {
  secondsLeft: number;
  durationMinutes: number;
}) {
  const total = durationMinutes * 60;
  const pct = total > 0 ? Math.min(100, (secondsLeft / total) * 100) : 0;
  const tone =
    secondsLeft <= 60 ? "danger" : secondsLeft <= 300 ? "warn" : "ok";
  const announce =
    secondsLeft <= 60
      ? "Less than one minute left."
      : secondsLeft <= 300
        ? "Five minutes left."
        : "";
  return (
    <div className={`mq-timer mq-timer--${tone}`}>
      <Clock size={16} />
      <span className="mq-timer__label">Time remaining</span>
      <strong className="mq-timer__value" role="timer">
        {formatCountdown(secondsLeft)}
      </strong>
      <span className="mq-timer__track" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </span>
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>
    </div>
  );
}

/** Past the deadline, and the automatic submit didn't make it in. */
function TimeUpCard({ message }: { message?: string }) {
  return (
    <div className="mq-center-panel">
      <div className="mq-locked-card">
        <div className="mq-icon-wrap amber">
          <Clock size={30} />
        </div>
        <h3 className="mq-card-title">Time&apos;s Up</h3>
        <p className="mq-card-desc">
          {message ||
            "The time limit for this sitting has passed, so the quiz can no longer be submitted."}
        </p>
      </div>
    </div>
  );
}

/**
 * The paper, one question at a time. Previous / Next move through it, the
 * numbered strip jumps anywhere (answered ones are filled), and progress is
 * saved per user so nothing is lost on a reload.
 */
function QuizForm({
  quiz,
  timer,
  submitToken,
  passMark,
}: {
  quiz: StudentQuiz;
  /** The paper may omit it; the summary carries it. */
  passMark?: number;
  /** The freshest server reading (paper or summary). */
  timer?: QuizTimer | null;
  /** Kept for the whole attempt; sent only on the automatic submit. */
  submitToken?: string | null;
}) {
  const { user } = useAuth();
  const userId = user?.id ?? "anon";
  const questions = quiz.questions ?? [];
  const lastIndex = Math.max(0, questions.length - 1);

  const [saved] = useState(() => readProgress(userId, quiz._id));
  const [answers, setAnswers] = useState<Record<number, number>>(
    saved.answers,
  );
  const [current, setCurrent] = useState(() =>
    Math.min(saved.current, lastIndex),
  );
  // Two-step submit when some questions are unanswered.
  const [confirmPartial, setConfirmPartial] = useState(false);
  const {
    mutate: submit,
    isPending,
    data: result,
    error: submitError,
  } = useSubmitQuiz();
  // A duplicate submit (409) still carries the recorded result.
  const priorAttempt = quizSubmitAttempt(submitError);
  const timeElapsed = isTimeElapsed(submitError);

  const { timed, secondsLeft, expired, durationMinutes } =
    useQuizCountdown(timer);

  const answeredCount = questions.filter((_, i) => answers[i] !== undefined)
    .length;
  const unanswered = questions.length - answeredCount;

  // Save on every change.
  useEffect(() => {
    try {
      localStorage.setItem(
        progressKey(userId, quiz._id),
        JSON.stringify({ answers, current }),
      );
    } catch {
      // Storage blocked — progress just won't survive a reload.
    }
  }, [answers, current, userId, quiz._id]);

  const clearSaved = () => {
    try {
      localStorage.removeItem(progressKey(userId, quiz._id));
    } catch {
      // ignore
    }
  };

  // The attempt is over one way or another — drop the saved progress.
  const finished = Boolean(result?.data || priorAttempt || timeElapsed);
  useEffect(() => {
    if (finished) clearSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // Every question, -1 for unanswered — the server scores against the
  // quiz's own list, so this is exact either way.
  const buildPayload = () => ({
    answers: questions.map((_, questionIndex) => ({
      questionIndex,
      selectedOptionIndex: answers[questionIndex] ?? -1,
    })),
  });

  const handleSubmit = () => {
    if (unanswered > 0 && !confirmPartial) {
      setConfirmPartial(true);
      return;
    }
    submit({ id: quiz._id, payload: buildPayload() });
  };

  // Time's up → submit automatically, ONCE, with the token. Never retried: a
  // late 400 retried is still late, and a 409 means it's already in.
  const autoFired = useRef(false);
  useEffect(() => {
    if (!timed || !expired || autoFired.current) return;
    if (result || submitError || isPending) return;
    autoFired.current = true;
    submit({ id: quiz._id, payload: buildPayload(), token: submitToken });
    // buildPayload reads current answers — intentionally not a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timed, expired, result, submitError, isPending]);

  const goTo = (i: number) => {
    setCurrent(Math.max(0, Math.min(lastIndex, i)));
    setConfirmPartial(false);
  };

  if (result?.data) {
    return <ResultCard score={result.data.score} passed={result.data.passed} />;
  }
  if (priorAttempt) {
    return (
      <ResultCard score={priorAttempt.score} passed={priorAttempt.passed} />
    );
  }
  if (timeElapsed) {
    return (
      <TimeUpCard
        message={
          (submitError as { response?: { data?: { message?: string } } })
            ?.response?.data?.message
        }
      />
    );
  }

  const locked = timed && expired;
  const q = questions[current];
  const isLast = current === lastIndex;

  return (
    <div className="mq-form-wrap">
      {timed && secondsLeft !== null && durationMinutes !== null && (
        <QuizTimerBar
          secondsLeft={secondsLeft}
          durationMinutes={durationMinutes}
        />
      )}

      {locked && (
        <div className="mq-timeup-note" role="status">
          <Clock size={15} /> Time&apos;s up — submitting your answers…
        </div>
      )}

      {/* Quiz header */}
      <div className="mq-quiz-header">
        <h3 className="mq-quiz-title">{quiz.title}</h3>
        {quiz.description && (
          <p className="mq-quiz-desc">{quiz.description}</p>
        )}
        <p className="mq-quiz-meta">
          {questions.length} questions
          {(quiz.passMark ?? passMark) != null
            ? ` · Pass mark: ${quiz.passMark ?? passMark}`
            : ""}
          {durationMinutes ? ` · ${durationMinutes} min time limit` : ""}
        </p>
      </div>

      {/* Where you are, and a jump to any question */}
      <div className="mq-steps">
        <div className="mq-steps__head">
          <span>
            Question <strong>{current + 1}</strong> of {questions.length}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="mq-steps__track" aria-hidden="true">
          <span
            style={{
              width: `${questions.length ? ((current + 1) / questions.length) * 100 : 0}%`,
            }}
          />
        </div>
        <nav className="mq-steps__dots" aria-label="Questions">
          {questions.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`mq-dot${i === current ? " is-current" : ""}${
                answers[i] !== undefined ? " is-answered" : ""
              }`}
              onClick={() => goTo(i)}
              aria-label={`Question ${i + 1}${
                answers[i] !== undefined ? ", answered" : ", not answered"
              }`}
              aria-current={i === current ? "step" : undefined}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      </div>

      {/* The current question */}
      {q && (
        <fieldset className="mq-question-card" key={q._id ?? current}>
          <legend className="mq-question-text">
            <span className="mq-question-num">Q{current + 1}.</span>
            {q.text}
          </legend>
          <div className="mq-options-list">
            {q.options.map((opt, oi) => {
              const selected = answers[current] === oi;
              return (
                <label
                  key={oi}
                  className={`mq-option-label${selected ? " selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={`q-${current}`}
                    checked={selected}
                    disabled={locked || isPending}
                    onChange={() => {
                      setAnswers((prev) => ({ ...prev, [current]: oi }));
                      setConfirmPartial(false);
                    }}
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Previous / Next — Submit on the last question */}
      <div className="mq-nav-row">
        <button
          type="button"
          className="mq-nav-btn"
          onClick={() => goTo(current - 1)}
          disabled={current === 0 || isPending}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {isLast ? (
          <button
            type="button"
            className={`modal-submit${confirmPartial ? " mq-submit--confirm" : ""}`}
            disabled={isPending || locked || questions.length === 0}
            onClick={handleSubmit}
          >
            {isPending
              ? "Submitting…"
              : confirmPartial
                ? `Submit with ${unanswered} unanswered?`
                : "Submit Quiz"}
          </button>
        ) : (
          <button
            type="button"
            className="mq-nav-btn mq-nav-btn--next"
            onClick={() => goTo(current + 1)}
            disabled={isPending}
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Submit from anywhere once everything is answered */}
      {!isLast && unanswered === 0 && (
        <p className="mq-all-done">
          All questions answered —{" "}
          <button type="button" className="mq-link" onClick={() => goTo(lastIndex)}>
            go to the last question to submit
          </button>
          .
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MyQuiz() {
  // Before Start: question-free sources only.
  const {
    data: summaryResp,
    isLoading: summaryLoading,
    isError: summaryFailed,
  } = useMyQuizSummary();
  const { data: sessionResp, isLoading: sessionLoading } = useMyQuizSession();
  const summary = summaryResp?.data;
  const mySession = sessionResp?.data;

  // The paper (questions) is fetched only once the student presses Start.
  const [started, setStarted] = useState(false);
  const {
    data: paperResp,
    isLoading: paperLoading,
    error: paperError,
  } = useMyQuiz(started);
  const paper = paperResp?.data;
  const errorLock = quizErrorLock(paperError);

  const sessionChip = mySession?.session
    ? {
        sitting: mySession.session.sitting,
        status: mySession.session.status,
        present: mySession.present,
      }
    : null;

  const intro: QuizIntro | null = summary?.quiz
    ? {
        title: summary.quiz.title,
        description: summary.quiz.description,
        totalQuestions: summary.quiz.totalQuestions,
        passMark: summary.quiz.passMark,
      }
    : mySession?.session?.quiz
      ? { title: mySession.session.quiz.title }
      : null;

  // Summary unavailable (older API): fall back to the sitting alone.
  const fallbackAvailable =
    summaryFailed &&
    mySession?.session?.status === "unlocked" &&
    Boolean(mySession.present);

  const body = (() => {
    // ── After Start: the paper ──
    if (started) {
      if (paperLoading)
        return (
          <div className="mq-center-panel">
            <SkeletonCard lines={4} className="mq-loading" label="Loading your quiz" />
          </div>
        );
      if (errorLock)
        return <LockedCard code={errorLock.code} message={errorLock.message} />;
      if (paper?.alreadySubmitted)
        return <ResultCard score={paper.score ?? 0} passed={paper.passed ?? false} />;
      // A gate can close between the summary and Start — show the lock.
      if (!paper || paper.locked || !paper.quiz)
        return (
          <LockedCard
            code={paper?.code}
            logbookTargets={paper?.logbookTargets}
            session={paper?.session}
            message={paper?.message}
          />
        );
      return (
        <QuizForm
          quiz={paper.quiz as StudentQuiz}
          // The newer reading wins — the summary re-syncs every minute.
          timer={newestTimer(paper.timer, summary?.timer)}
          submitToken={paper.submitToken}
          passMark={summary?.quiz?.passMark}
        />
      );
    }

    // ── Before Start: summary + sitting, no questions ──
    if (summaryLoading || sessionLoading)
      return (
        <div className="mq-center-panel">
          <SkeletonCard lines={4} className="mq-loading" label="Loading quiz" />
        </div>
      );

    if (summary?.state === "submitted" && summary.attempt)
      return (
        <ResultCard score={summary.attempt.score} passed={summary.attempt.passed} />
      );

    if (summary?.state === "locked" && summary.lock)
      return (
        <LockedCard
          code={summary.lock.code}
          logbookTargets={summary.lock.logbookTargets}
          session={summary.lock.session ?? mySession?.session ?? null}
          message={summary.lock.message}
        />
      );

    if ((summary?.state === "available" || fallbackAvailable) && intro)
      return (
        <QuizIntroCard
          intro={intro}
          session={sessionChip}
          timer={summary?.timer}
          onStart={() => setStarted(true)}
        />
      );

    return (
      <div
        style={{
          textAlign: "center",
          padding: 60,
          color: "var(--color-text-muted)",
        }}
      >
        {summary?.nextStep ??
          mySession?.message ??
          "No quiz is available for you at the moment."}
      </div>
    );
  })();

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

      {body}
    </div>
  );
}
