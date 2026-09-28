import { ClipboardList, Info } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import {
  useQuiz,
  useReorderQuizQuestions,
} from "../../../hooks/useQuizzes";
import { ReorderableList } from "../../ui/ReorderableList/ReorderableList";
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
  const { mutateAsync: reorder } = useReorderQuizQuestions();
  // Reordering sends question ids; without them (older data) show it read-only.
  const canReorder = Boolean(quiz?.questions.every((q) => q._id));

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
          {canReorder && quiz.questions.length > 1 && (
            <div className="builder-warn" style={infoNote}>
              <Info size={14} />
              <span>
                Students answer in this order. Drag a question, or use the
                arrows, to reorder it.
              </span>
            </div>
          )}

          {canReorder ? (
            <ReorderableList<QuizQuestion>
              items={quiz.questions}
              getId={(q) => q._id!}
              getLabel={(q) => `"${q.text}"`}
              multiline
              onReorder={(next) =>
                reorder({ id, questionIds: next.map((q) => q._id!) })
              }
              renderItem={(question) => <QuestionBody question={question} />}
            />
          ) : (
            quiz.questions.map((question, qi) => (
              <div key={question._id ?? qi} style={staticCard}>
                <QuestionBody question={question} number={qi + 1} />
              </div>
            ))
          )}
        </div>
      )}
    </CustomModal>
  );
}

const infoNote = {
  background: "var(--color-accent-muted)",
  color: "var(--color-text-secondary)",
};

const staticCard = {
  border: "1px solid var(--color-border)",
  borderRadius: 10,
  padding: 14,
};

function QuestionBody({
  question,
  number,
}: {
  question: QuizQuestion;
  /** Shown when the list doesn't number rows itself. */
  number?: number;
}) {
  return (
    <>
      <div style={{ fontWeight: 700, fontSize: 14 }}>
        {number !== undefined && `${number}. `}
        {question.text}{" "}
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
        {question.options.map((opt, oi) => {
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
    </>
  );
}
