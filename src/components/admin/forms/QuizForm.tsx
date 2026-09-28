import { useState, type FormEvent } from "react";
import { AlertTriangle, HelpCircle, Plus, Trash2 } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import {
  useCreateQuiz,
  useQuiz,
  useUpdateQuiz,
} from "../../../hooks/useQuizzes";
import type { CreateQuizPayload, Quiz } from "../../../api/types/quiz";
import "./BuilderForm.css";

interface DraftQuestion {
  /** Kept from the loaded quiz and sent back — see `CreateQuizPayload`. */
  _id?: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
}

const blankQuestion = (): DraftQuestion => ({
  text: "",
  options: ["", ""],
  correctOptionIndex: 0,
  points: 1,
});

interface QuizFormProps {
  isOpen: boolean;
  onClose: () => void;
  /** Edit this quiz; omit to create a new one. */
  editingId?: string;
}

/** Loads the quiz when editing, then hands the form its starting values. */
export default function QuizForm({ isOpen, onClose, editingId }: QuizFormProps) {
  const { data, isLoading } = useQuiz(editingId ?? "");

  if (editingId && (isLoading || !data?.data)) {
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Quiz"
        icon={<HelpCircle size={16} />}
        size="large"
        isLoading={isLoading}
      >
        {!isLoading && (
          <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
            This quiz couldn't be loaded. Close and try again.
          </p>
        )}
      </CustomModal>
    );
  }

  return (
    <QuizFormInner
      key={editingId ?? "new"}
      isOpen={isOpen}
      onClose={onClose}
      editing={editingId ? data?.data : undefined}
    />
  );
}

/**
 * Turns the draft into the API payload, or explains what's wrong with it.
 * Blank options are dropped, so the correct answer's index is remapped to
 * where it lands — otherwise a blank above it would shift the answer.
 */
function buildQuestions(
  drafts: DraftQuestion[],
): { questions: CreateQuizPayload["questions"] } | { error: string } {
  const questions: CreateQuizPayload["questions"] = [];

  for (const [qi, q] of drafts.entries()) {
    const n = qi + 1;
    const text = q.text.trim();
    const filled = q.options
      .map((o, index) => ({ text: o.trim(), index }))
      .filter((o) => o.text);

    // An untouched question is just ignored.
    if (!text && filled.length === 0) continue;
    if (!text) return { error: `Question ${n} has options but no question text.` };
    if (filled.length < 2)
      return { error: `Question ${n} needs at least two filled-in options.` };

    const correct = filled.findIndex((o) => o.index === q.correctOptionIndex);
    if (correct === -1)
      return { error: `Question ${n}: the option marked correct is empty.` };
    if (!Number.isFinite(q.points) || q.points < 1)
      return { error: `Question ${n} must be worth at least 1 point.` };

    questions.push({
      // Without its id, PUT /quizzes/:id recreates the question as new.
      ...(q._id ? { _id: q._id } : {}),
      text,
      options: filled.map((o) => o.text),
      correctOptionIndex: correct,
      points: q.points,
    });
  }

  if (questions.length === 0) return { error: "Add at least one question." };
  return { questions };
}

interface QuizFormInnerProps {
  isOpen: boolean;
  onClose: () => void;
  editing?: Quiz;
}

function QuizFormInner({ isOpen, onClose, editing }: QuizFormInnerProps) {
  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [passMark, setPassMark] = useState(editing?.passMark ?? 50);
  const [questions, setQuestions] = useState<DraftQuestion[]>(() =>
    editing?.questions.length
      ? editing.questions.map((q) => ({
          _id: q._id,
          text: q.text,
          options: [...q.options],
          correctOptionIndex: q.correctOptionIndex,
          points: q.points,
        }))
      : [blankQuestion()],
  );
  const [error, setError] = useState("");

  const { mutate: create, isPending: creating } = useCreateQuiz();
  const { mutate: update, isPending: updating } = useUpdateQuiz();
  const isPending = creating || updating;

  const edit = (fn: (prev: DraftQuestion[]) => DraftQuestion[]) => {
    setQuestions(fn);
    if (error) setError("");
  };

  const addQuestion = () => edit((prev) => [...prev, blankQuestion()]);
  const removeQuestion = (qi: number) =>
    edit((prev) => prev.filter((_, i) => i !== qi));
  const setQuestionField = (
    qi: number,
    field: "text" | "points",
    value: string,
  ) =>
    edit((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, [field]: field === "points" ? Number(value) : value }
          : q,
      ),
    );

  const addOption = (qi: number) =>
    edit((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, options: [...q.options, ""] } : q)),
    );
  const removeOption = (qi: number, oi: number) =>
    edit((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        const options = q.options.filter((_, j) => j !== oi);
        // Keep pointing at the same answer: shift down if it was below the
        // removed option, fall back to the first if it was the removed one.
        const correctOptionIndex =
          q.correctOptionIndex === oi
            ? 0
            : q.correctOptionIndex > oi
              ? q.correctOptionIndex - 1
              : q.correctOptionIndex;
        return { ...q, options, correctOptionIndex };
      }),
    );
  const setOption = (qi: number, oi: number, value: string) =>
    edit((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) }
          : q,
      ),
    );
  const setCorrect = (qi: number, oi: number) =>
    edit((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, correctOptionIndex: oi } : q)),
    );

  const totalPoints = questions.reduce(
    (sum, q) => sum + (Number.isFinite(q.points) ? q.points : 0),
    0,
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (passMark < 0 || passMark > 100) {
      setError("Pass mark must be between 0 and 100.");
      return;
    }
    const built = buildQuestions(questions);
    if ("error" in built) {
      setError(built.error);
      return;
    }

    const payload: CreateQuizPayload = {
      title: title.trim(),
      // Editing sends "" so a description can be cleared; creating omits it.
      description: editing ? description.trim() : description.trim() || undefined,
      passMark,
      questions: built.questions,
    };

    if (editing) update({ id: editing._id, data: payload }, { onSuccess: onClose });
    else create(payload, { onSuccess: onClose });
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Edit Quiz" : "Add Quiz"}
      subtitle={
        editing
          ? `Update ${editing.title}`
          : "Build the quiz with questions and options"
      }
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
            ) : editing ? (
              "Save Changes"
            ) : (
              "Create Quiz"
            )}
          </button>
        </>
      }
    >
      <form id="quiz-form" onSubmit={handleSubmit} className="builder-form">
        {error && (
          <div className="builder-warn" role="alert">
            <AlertTriangle size={14} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label className="modal-label" htmlFor="quiz-title">
            Title <span>*</span>
          </label>
          <input
            id="quiz-title"
            className="modal-input"
            placeholder="e.g. Clinical Safety Quiz"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="modal-label" htmlFor="quiz-description">
            Description
          </label>
          <textarea
            id="quiz-description"
            className="modal-input"
            rows={2}
            placeholder="Short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group builder-field--narrow">
          <label className="modal-label" htmlFor="quiz-pass-mark">
            Pass Mark (%) <span>*</span>
          </label>
          <input
            id="quiz-pass-mark"
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
          <span className="modal-label">
            Questions · {questions.length} ({totalPoints}{" "}
            {totalPoints === 1 ? "point" : "points"})
          </span>
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
                aria-label={`Remove question ${qi + 1}`}
                title="Remove question"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <input
              className="modal-input"
              placeholder="Question text"
              aria-label={`Question ${qi + 1} text`}
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
                    aria-label={`Question ${qi + 1}, option ${oi + 1}`}
                    value={opt}
                    onChange={(e) => setOption(qi, oi, e.target.value)}
                  />
                  <button
                    type="button"
                    className="builder-remove-btn"
                    onClick={() => removeOption(qi, oi)}
                    disabled={q.options.length <= 2}
                    aria-label={`Remove option ${oi + 1}`}
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
              <label className="modal-label" htmlFor={`quiz-points-${qi}`}>
                Points
              </label>
              <input
                id={`quiz-points-${qi}`}
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
