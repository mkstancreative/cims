import { useMemo, useState, type FormEvent } from "react";
import { HelpCircle, Unlink } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import {
  useAssignBatchQuiz,
  useUnassignBatchQuiz,
} from "../../../hooks/useBatches";
import { useQuizzes } from "../../../hooks/useQuizzes";
import { batchQuizId, batchQuizTitle } from "../../../helpers/batchQuiz";
import type { Batch } from "../../../api/types/batch";
import "./BatchQuizModal.css";

interface BatchQuizModalProps {
  batch: Batch;
  onClose: () => void;
}

/** Shows the quiz a batch has, and assigns, changes or unassigns it. */
export default function BatchQuizModal({
  batch: opened,
  onClose,
}: BatchQuizModalProps) {
  const [quizId, setQuizId] = useState(batchQuizId(opened) ?? "");
  /**
   * What this dialog itself last did (null = unassigned) — the batch it was
   * opened with is a snapshot and doesn't see that change.
   */
  const [ownChange, setOwnChange] = useState<string | null | undefined>(
    undefined,
  );

  // All quizzes (inactive too) so an assigned id can always be named; only
  // active ones are offered.
  const { data: quizzesResp, isLoading: loadingQuizzes } = useQuizzes({
    limit: 100,
  });
  const { mutate: assign, isPending: assigning } = useAssignBatchQuiz();
  const { mutate: unassign, isPending: unassigning } = useUnassignBatchQuiz();

  const quizzes = useMemo(() => quizzesResp?.data ?? [], [quizzesResp]);
  const names = useMemo(
    () => new Map(quizzes.map((q) => [q._id, q.title])),
    [quizzes],
  );
  const activeQuizzes = quizzes.filter((q) => q.isActive);

  const batch: Batch =
    ownChange === undefined ? opened : { ...opened, quiz: ownChange };
  const currentId = batchQuizId(batch);
  const currentTitle = batchQuizTitle(batch, names);
  const currentQuiz = quizzes.find((q) => q._id === currentId);

  const busy = assigning || unassigning;
  const changed = Boolean(quizId) && quizId !== currentId;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!changed) return;
    assign({ id: batch._id, quizId }, { onSuccess: onClose });
  };

  const handleUnassign = () =>
    unassign(batch._id, {
      onSuccess: () => {
        setOwnChange(null);
        setQuizId("");
      },
    });

  return (
    <CustomModal
      isOpen
      onClose={onClose}
      title="Batch Quiz"
      subtitle={`${batch.name} · ${batch.session}`}
      icon={<HelpCircle size={16} />}
      size="medium"
      footer={
        <>
          <button
            type="button"
            className="modal-cancel"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="batch-quiz-form"
            className="modal-submit"
            disabled={busy || !changed}
          >
            {assigning ? (
              <Spinner size={14} color="#fff" text="" />
            ) : currentId ? (
              "Change Quiz"
            ) : (
              "Assign"
            )}
          </button>
        </>
      }
    >
      <form id="batch-quiz-form" onSubmit={handleSubmit} className="bq">
        {/* ── Current ── */}
        <section>
          <p className="bq-label">Current quiz</p>
          {currentTitle ? (
            <div className="bq-current">
              <HelpCircle size={16} />
              <span className="bq-current__title">
                {currentTitle}
                {currentQuiz && !currentQuiz.isActive && (
                  <em className="bq-tag bq-tag--muted">inactive</em>
                )}
              </span>
              <button
                type="button"
                className="bq-unassign"
                onClick={handleUnassign}
                disabled={busy}
              >
                <Unlink size={13} /> {unassigning ? "Unassigning…" : "Unassign"}
              </button>
            </div>
          ) : (
            <p className="bq-empty">No quiz assigned to this batch.</p>
          )}
        </section>

        {/* ── Choose ── */}
        <div className="form-group">
          <label className="modal-label" htmlFor="batch-quiz-select">
            {currentTitle ? "Change to" : "Assign a quiz"}
          </label>
          <select
            id="batch-quiz-select"
            className="modal-input"
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
            disabled={loadingQuizzes || busy}
          >
            <option value="">
              {loadingQuizzes ? "Loading…" : "Select a quiz"}
            </option>
            {activeQuizzes.map((q) => (
              <option key={q._id} value={q._id}>
                {q.title}
              </option>
            ))}
          </select>
        </div>
      </form>
    </CustomModal>
  );
}
