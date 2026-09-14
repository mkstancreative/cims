import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Info } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import {
  useOpenQuizSession,
  liveSessionId,
} from "../../../hooks/useQuizSessions";
import { useBatches, useMyBatches } from "../../../hooks/useBatches";
import { useAuth } from "../../../context/useAuth";
import type { Batch } from "../../../api/types/batch";
import "./BatchForm.css";

interface OpenSittingFormProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Opens a sitting and seeds the roll from every placed/active student in the
 * batch. A supervisor only ever sees their own batches — the API scopes them
 * too, and answers 403 on anyone else's.
 */
export default function OpenSittingForm({
  isOpen,
  onClose,
}: OpenSittingFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSupervisor = user?.role === "supervisor";

  const [batchId, setBatchId] = useState("");

  // Only one of these actually runs — `/batches` is admin-only.
  const adminBatches = useBatches({ limit: 100 }, !isSupervisor);
  const myBatches = useMyBatches(isSupervisor);
  const source = isSupervisor ? myBatches : adminBatches;
  const batches: Batch[] =
    (source.data as { data?: Batch[] } | undefined)?.data ?? [];

  const { mutate: open, isPending } = useOpenQuizSession();

  const rolePrefix = isSupervisor ? "/supervisor" : "/admin";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!batchId) return;
    open(
      { batchId },
      {
        onSuccess: (res) => {
          onClose();
          const id = res?.data?._id;
          if (id) navigate(`${rolePrefix}/quiz-sittings/${id}`);
        },
        onError: (err) => {
          // 409 — a sitting is already live. The body carries its id, so send
          // them straight there instead of leaving them stuck.
          const existing = liveSessionId(err);
          if (existing) {
            onClose();
            navigate(`${rolePrefix}/quiz-sittings/${existing}`);
          }
        },
      },
    );
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Open Quiz Sitting"
      subtitle="Seed the roll from the batch's placed and active students"
      icon={<ClipboardCheck size={16} />}
      size="medium"
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
            form="open-sitting-form"
            className="modal-submit"
            disabled={isPending || !batchId}
          >
            {isPending ? (
              <Spinner size={14} color="#fff" text="" />
            ) : (
              "Open Sitting"
            )}
          </button>
        </>
      }
    >
      <form id="open-sitting-form" onSubmit={handleSubmit} className="form-grid">
        <div className="form-group col-1">
          <label className="modal-label">
            Batch <span>*</span>
          </label>
          <select
            className="modal-input"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            required
            disabled={source.isLoading}
          >
            <option value="">
              {source.isLoading ? "Loading batches…" : "Select a batch"}
            </option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} — {b.session}
              </option>
            ))}
          </select>
        </div>

        <div
          className="bf-note col-1"
          style={{
            background: "var(--color-accent-muted)",
            color: "var(--color-text-secondary)",
          }}
        >
          <Info size={14} />
          <span>
            Everyone starts absent. Mark who is in the room, save, then unlock —
            only the students marked present can take the quiz. The sitting uses
            the batch's assigned quiz.
          </span>
        </div>
      </form>
    </CustomModal>
  );
}
