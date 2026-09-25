import { ClipboardList } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import { useQuiz } from "../../../hooks/useQuizzes";
import type { Quiz, QuizQuestion } from "../../../api/types/quiz";

interface QuizViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

export default function QuizViewModal({
  isOpen,
  onClose,
  id,
}: QuizViewModalProps) {
  const { data, isLoading } = useQuiz(id);
  const quiz: Quiz | undefined = data?.data;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={quiz?.title ?? "Quiz"}
      subtitle={
        quiz ? `Pass mark: ${quiz.passMark}% · ${quiz.questions.length} questions` : undefined
      }
      icon={<ClipboardList size={16} />}
      size="large"
      isLoading={isLoading}
    >
      {quiz && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {quiz.description && (
            <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
              {quiz.description}
            </p>
          )}
          {quiz.questions.map((question: QuizQuestion, qi: number) => (
            <div
              key={question._id ?? qi}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: 14,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {qi + 1}. {question.text}{" "}
                <span
                  style={{
                    fontSize: 11.5,
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  ({question.points} pt{question.points !== 1 ? "s" : ""})
                </span>
              </div>
              <ul style={{ margin: "10px 0 0", paddingLeft: 18 }}>
                {question.options.map((opt: string, oi: number) => {
                  const correct = oi === question.correctOptionIndex;
                  return (
                    <li
                      key={oi}
                      style={{
                        fontSize: 13,
                        marginBottom: 4,
                        color: correct
                          ? "var(--color-primary)"
                          : "var(--color-text-primary)",
                        fontWeight: correct ? 700 : 400,
                      }}
                    >
                      {opt}
                      {correct && " ✓"}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </CustomModal>
  );
}
