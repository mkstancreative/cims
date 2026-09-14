import { useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useEnrollRegistration } from "../../../hooks/useRegistrations";
import { useBatches } from "../../../hooks/useBatches";
import type { Registration } from "../../../api/types/registration";
import type { Batch } from "../../../api/types/batch";
import { applicantName } from "../../../helpers/registration";
import { durationLabel, formatPrice } from "../../../helpers/duration";
import "./BatchForm.css";

interface EnrollRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration;
}

export default function EnrollRegistrationForm({
  isOpen,
  onClose,
  registration,
}: EnrollRegistrationFormProps) {
  const [batchId, setBatchId] = useState("");
  const [showAll, setShowAll] = useState(false);
  const { data: batches, isLoading } = useBatches({ limit: 100 });
  const { mutate: enroll, isPending } = useEnrollRegistration();

  const paidDurationId = registration.duration?._id ?? null;
  const all: Batch[] = batches?.data ?? [];

  // Filtering to matching-duration batches avoids the 400 entirely. A
  // registration that predates durations has nothing to match on, so it sees
  // the full list and the API answers with an advisory warning instead.
  const matching = paidDurationId
    ? all.filter((b) => b.duration?._id === paidDurationId)
    : all;
  const options = showAll || !paidDurationId ? all : matching;
  const hiddenCount = all.length - matching.length;

  const selected = all.find((b) => b._id === batchId) ?? null;
  const mismatch =
    Boolean(paidDurationId) &&
    Boolean(selected) &&
    selected!.duration?._id !== paidDurationId;
  const batchHasNoDuration = Boolean(selected) && !selected!.duration;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!batchId) return;
    enroll({ id: registration._id, batchId }, { onSuccess: onClose });
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Enroll Applicant"
      subtitle={`Assign ${applicantName(registration)} to a batch`}
      icon={<CheckCircle2 size={16} />}
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
            form="enroll-form"
            className="modal-submit"
            disabled={isPending || !batchId}
          >
            {isPending ? <Spinner size={14} color="#fff" text="" /> : "Enroll"}
          </button>
        </>
      }
    >
      <form id="enroll-form" onSubmit={handleSubmit} className="form-grid">
        {registration.duration ? (
          <div
            className="bf-note col-1"
            style={{
              background: "var(--color-accent-muted)",
              color: "var(--color-text-secondary)",
            }}
          >
            <Info size={14} />
            <span>
              This student paid for{" "}
              <strong>{durationLabel(registration.duration)}</strong> (
              {formatPrice(registration.duration.price)}). Only batches with
              that duration are listed.
            </span>
          </div>
        ) : (
          <div className="bf-note bf-note--warn col-1">
            <AlertTriangle size={14} />
            <span>
              This registration predates durations, so there is nothing to match
              against. Enrolment will go through with an advisory warning.
            </span>
          </div>
        )}

        <div className="form-group col-1">
          <label className="modal-label">
            Batch <span>*</span>
          </label>
          <select
            className="modal-input"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            required
            disabled={isLoading}
          >
            <option value="">
              {isLoading ? "Loading batches…" : "Select a batch"}
            </option>
            {options.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} — {b.session}
                {b.duration ? ` (${durationLabel(b.duration)})` : " (no duration set)"}
              </option>
            ))}
          </select>

          {!isLoading && options.length === 0 && (
            <span className="bf-hint bf-hint--error">
              No batch matches this student's duration yet. Create one with the
              same duration, or widen the list below.
            </span>
          )}

          {paidDurationId && hiddenCount > 0 && (
            <button
              type="button"
              className="bf-hint"
              style={{
                border: "none",
                background: "none",
                padding: 0,
                textAlign: "left",
                cursor: "pointer",
                color: "var(--color-accent)",
                fontWeight: 600,
              }}
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll
                ? "Show only matching batches"
                : `Show all batches (${hiddenCount} hidden with a different duration)`}
            </button>
          )}
        </div>

        {batchHasNoDuration && (
          <div className="bf-note bf-note--warn col-1">
            <AlertTriangle size={14} />
            <span>
              This batch has no duration set. Enrolment will be refused — set
              the batch's duration before enrolling students into it.
            </span>
          </div>
        )}

        {mismatch && !batchHasNoDuration && (
          <div className="bf-note bf-note--warn col-1">
            <AlertTriangle size={14} />
            <span>
              {selected!.name} is a {durationLabel(selected!.duration)}{" "}
              placement ({formatPrice(selected!.duration?.price)}), but this
              student paid for {durationLabel(registration.duration)} (
              {formatPrice(registration.duration?.price)}). Enrolment will be
              refused.
            </span>
          </div>
        )}
      </form>
    </CustomModal>
  );
}
