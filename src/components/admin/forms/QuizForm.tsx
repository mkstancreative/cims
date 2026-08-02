import { useState, type FormEvent } from "react";
import { HelpCircle, Plus, Trash2 } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useCreateQuiz } from "../../../hooks/useQuizzes";
import type { CreateQuizPayload } from "../../../api/types/quiz";
import "./BuilderForm.css";

interface DraftQuestion {
  text: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
}

interface QuizFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuizForm({ isOpen, onClose }: QuizFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passMark, setPassMark] = useState(50);
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    { text: "", options: ["", ""], correctOptionIndex: 0, points: 1 },
  ]);
  const { mutate: create, isPending } = useCreateQuiz();

  const addQuestion = () =>
    setQuestions((prev) => [
      ...prev,
      { text: "", options: ["", ""], correctOptionIndex: 0, points: 1 },
    ]);
  const removeQuestion = (qi: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== qi));
  const setQuestionField = (
    qi: number,
    field: "text" | "points",
    value: string,
  ) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? {
              ...q,
              [field]: field === "points" ? Number(value) : value,
            }
          : q,
      ),
    );

  const addOption = (qi: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, options: [...q.options, ""] } : q,
      ),
    );
  const removeOption = (qi: number, oi: number) =>
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        const options = q.options.filter((_, j) => j !== oi);
        const correctOptionIndex =
          q.correctOptionIndex >= options.length
            ? Math.max(0, options.length - 1)
            : q.correctOptionIndex;
        return { ...q, options, correctOptionIndex };
      }),
    );
  const setOption = (qi: number, oi: number, value: string) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? {
              ...q,
              options: q.options.map((o, j) => (j === oi ? value : o)),
            }
          : q,
      ),
    );
  const setCorrect = (qi: number, oi: number) =>
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, correctOptionIndex: oi } : q)),
    );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload: CreateQuizPayload = {
      title,
      description: description || undefined,
      passMark,
      questions: questions
        .filter((q) => q.text.trim())
        .map((q) => ({
          text: q.text,
          options: q.options.filter((o) => o.trim()),
          correctOptionIndex: q.correctOptionIndex,
          points: q.points,
        })),
    };
    create(payload, { onSuccess: onClose });
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Quiz"
      subtitle="Build the quiz with questions and options"
      icon={<HelpCircle size={16} />}
      size="large"
      footer={
        <>
          <button
            type="button"
            className="modal-cancel"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="quiz-form"
            className="modal-submit"
            disabled={isPending}
          >
            {isPending ? (
              <Spinner size={14} color="#fff" text="" />
            ) : (
              "Create Quiz"
            )}
          </button>
        </>
      }
    >
      <form id="quiz-form" onSubmit={handleSubmit} className="builder-form">
        <div className="form-group">
          <label className="modal-label">
            Title <span>*</span>
          </label>
          <input
            className="modal-input"
            placeholder="e.g. Clinical Safety Quiz"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="modal-label">Description</label>
          <textarea
            className="modal-input"
            rows={2}
            placeholder="Short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group builder-field--narrow">
          <label className="modal-label">
            Pass Mark (%) <span>*</span>
          </label>
          <input
            type="number"
            min={0}
            max={100}
            className="modal-input"
            value={passMark}
            onChange={(e) => setPassMark(Number(e.target.value))}
            required
          />
        </div>

        <div className="builder-toolbar">
          <span className="modal-label">Questions</span>
          <button
            type="button"
            className="builder-add-btn"
            onClick={addQuestion}
          >
            <Plus size={13} /> Add Question
          </button>
        </div>

        {questions.map((q, qi) => (
          <div key={qi} className="builder-card">
            <div className="builder-card-head">
              <span className="builder-card-title">Question {qi + 1}</span>
              <button
                type="button"
                className="builder-remove-btn builder-remove-btn--push"
                onClick={() => removeQuestion(qi)}
                disabled={questions.length <= 1}
                aria-label="Remove question"
                title="Remove question"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <input
              className="modal-input"
              placeholder="Question text"
              value={q.text}
              onChange={(e) => setQuestionField(qi, "text", e.target.value)}
            />

            <div className="builder-sublist">
              <span className="builder-hint">
                Options (select the correct one)
              </span>
              {q.options.map((opt, oi) => (
                <div key={oi} className="builder-subrow">
                  <input
                    type="radio"
                    className="builder-radio"
                    name={`correct-${qi}`}
                    checked={q.correctOptionIndex === oi}
                    onChange={() => setCorrect(qi, oi)}
                    aria-label={`Mark option ${oi + 1} correct`}
                  />
                  <input
                    className="modal-input"
                    placeholder={`Option ${oi + 1}`}
                    value={opt}
                    onChange={(e) => setOption(qi, oi, e.target.value)}
                  />
                  <button
                    type="button"
                    className="builder-remove-btn"
                    onClick={() => removeOption(qi, oi)}
                    disabled={q.options.length <= 2}
                    aria-label="Remove option"
                    title="Remove option"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="builder-add-btn builder-add-btn--sub"
                onClick={() => addOption(qi)}
              >
                <Plus size={12} /> Add Option
              </button>
            </div>

            <div className="form-group builder-field--tiny">
              <label className="modal-label">Points</label>
              <input
                type="number"
                min={1}
                className="modal-input"
                value={q.points}
                onChange={(e) => setQuestionField(qi, "points", e.target.value)}
              />
            </div>
          </div>
        ))}
      </form>
    </CustomModal>
  );
}
