import { useState } from "react";
import { FileQuestion, Lock, XCircle, Award } from "lucide-react";
import { useMyQuiz, useSubmitQuiz } from "../../hooks/useQuizzes";
import Spinner from "../../components/ui/Spinner/Spinner";
import type { StudentQuiz } from "../../api/types/quiz";

// ─── Locked state ─────────────────────────────────────────────────────────────
function LockedCard({
  curriculum,
  message,
}: {
  curriculum?: { totalSubtopics: number; approvedSubtopics: number; percent: number };
  message?: string;
}) {
  const percent = curriculum?.percent ?? 0;
  return (
    <div
      style={{
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        padding: 32,
        textAlign: "center",
        maxWidth: 560,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(245,158,11,.12)",
          color: "#f59e0b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 18px",
        }}
      >
        <Lock size={30} />
      </div>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "var(--color-text-primary)",
          marginBottom: 8,
        }}
      >
        Quiz Locked
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "var(--color-text-muted)",
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        {message ||
          "You need to complete more of your curriculum before the quiz unlocks. Keep working through your approved subtopics."}
      </p>

      {curriculum && (
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            <span style={{ color: "var(--color-text-muted)" }}>
              Curriculum Progress
            </span>
            <span style={{ fontWeight: 700 }}>
              {curriculum.approvedSubtopics}/{curriculum.totalSubtopics} approved
            </span>
          </div>
          <div
            style={{
              height: 10,
              borderRadius: 6,
              background: "var(--color-surface-overlay)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(percent, 100)}%`,
                background: "linear-gradient(90deg,#f59e0b,#d97706)",
                borderRadius: 6,
                transition: "width .6s ease",
              }}
            />
          </div>
          <div
            style={{
              textAlign: "right",
              fontSize: 12,
              fontWeight: 700,
              color: "#d97706",
              marginTop: 6,
            }}
          >
            {percent}%
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Result state ─────────────────────────────────────────────────────────────
function ResultCard({ score, passed }: { score: number; passed: boolean }) {
  return (
    <div
      style={{
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        padding: 32,
        textAlign: "center",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: passed ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)",
          color: passed ? "#10b981" : "#ef4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 18px",
        }}
      >
        {passed ? <Award size={32} /> : <XCircle size={32} />}
      </div>
      <h3
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: "var(--color-text-primary)",
          marginBottom: 6,
        }}
      >
        {passed ? "Quiz Passed!" : "Quiz Completed"}
      </h3>
      <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
        Your score
      </p>
      <div
        style={{
          fontSize: 44,
          fontWeight: 900,
          color: passed ? "#10b981" : "#ef4444",
          margin: "4px 0 8px",
        }}
      >
        {score}
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: passed ? "#10b981" : "#ef4444",
        }}
      >
        {passed ? "You met the pass mark." : "You did not meet the pass mark."}
      </span>
    </div>
  );
}

// ─── Quiz form ────────────────────────────────────────────────────────────────
function QuizForm({ quiz }: { quiz: StudentQuiz }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const { mutate: submit, isPending, data: result } = useSubmitQuiz();

  const allAnswered = quiz.questions.every((_, i) => answers[i] !== undefined);

  const handleSubmit = () => {
    const payload = {
      answers: quiz.questions.map((_, questionIndex) => ({
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
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <div
        style={{
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          borderRadius: 14,
          padding: "16px 20px",
          marginBottom: 18,
        }}
      >
        <h3 style={{ fontSize: 17, fontWeight: 700 }}>{quiz.title}</h3>
        {quiz.description && (
          <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            {quiz.description}
          </p>
        )}
        <p style={{ fontSize: 12, color: "var(--color-text-subtle)", marginTop: 6 }}>
          {quiz.questions.length} questions · Pass mark: {quiz.passMark}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {quiz.questions.map((q, qi) => (
          <div
            key={q._id ?? qi}
            style={{
              background: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              padding: 18,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
              <span style={{ color: "var(--color-accent)", marginRight: 8 }}>
                Q{qi + 1}.
              </span>
              {q.text}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                return (
                  <label
                    key={oi}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 14,
                      border: selected
                        ? "1px solid var(--color-accent)"
                        : "1px solid var(--color-border)",
                      background: selected
                        ? "var(--color-accent-soft)"
                        : "var(--color-bg-primary)",
                    }}
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
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 14,
          marginTop: 20,
        }}
      >
        <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          {Object.keys(answers).length}/{quiz.questions.length} answered
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

export default function MyQuiz() {
  const { data, isLoading } = useMyQuiz();

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
      ) : quizData.locked || !quizData.quiz ? (
        <LockedCard
          curriculum={quizData.curriculum}
          message={quizData.message}
        />
      ) : (
        <QuizForm quiz={quizData.quiz} />
      )}
    </div>
  );
}
