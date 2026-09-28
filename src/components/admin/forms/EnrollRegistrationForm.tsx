import { useMemo, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
  Filter,
} from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useEnrollRegistrations } from "../../../hooks/useRegistrations";
import { useBatches } from "../../../hooks/useBatches";
import {
  ENROLL_MAX_IDS,
  type EnrollResponse,
  type FailedRow,
  type Registration,
} from "../../../api/types/registration";
import type { Batch } from "../../../api/types/batch";
import { applicantName } from "../../../helpers/registration";
import { durationLabel, formatPrice } from "../../../helpers/duration";
import "./BatchForm.css";
import "./EnrollRegistrationForm.css";

interface EnrollRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  /** One or many — enrolling one student is an array of one. */
  registrations: Registration[];
  /** Ids that made it in, so the caller can drop them from a selection. */
  onEnrolled?: (registrationIds: string[]) => void;
  /** Narrow the queue to a duration (offered for DURATION_MISMATCH rows). */
  onShowDuration?: (durationId: string) => void;
}

/** How each failure reason is explained, most actionable first. */
const REASONS: Record<string, { title: string; hint: string }> = {
  DURATION_MISMATCH: {
    title: "Paid for a different placement length",
    hint: "Enrol these into a batch that runs the duration they paid for.",
  },
  ENROLL_FAILED: {
    title: "Couldn't be enrolled (server error)",
    hint: "Nothing was written for these — it's safe to try them again.",
  },
  NOT_NEW: {
    title: "Not awaiting enrolment",
    hint: "Already enrolled, rejected, or not yet paid. Nothing to do — the queue has been refreshed.",
  },
  NOT_FOUND: {
    title: "No longer exist",
    hint: "The list was out of date. The queue has been refreshed.",
  },
};
const REASON_ORDER = Object.keys(REASONS);

export default function EnrollRegistrationForm({
  isOpen,
  onClose,
  registrations,
  onEnrolled,
  onShowDuration,
}: EnrollRegistrationFormProps) {
  const [batchId, setBatchId] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [result, setResult] = useState<EnrollResponse | null>(null);
  const { data: batches, isLoading } = useBatches({ limit: 100 });
  const { mutate: enroll, isPending } = useEnrollRegistrations();

  const count = registrations.length;
  const single = count === 1 ? registrations[0] : null;
  const overCap = count > ENROLL_MAX_IDS;
  const byId = useMemo(
    () => new Map(registrations.map((r) => [r._id, r])),
    [registrations],
  );

  // The page only lets one duration be selected at a time, so every student
  // here paid for the same tier (or all predate durations). Listing only
  // batches of that tier avoids DURATION_MISMATCH entirely.
  const sharedTier = registrations[0]?.duration ?? null;

  const all: Batch[] = batches?.data ?? [];
  const matching = sharedTier
    ? all.filter((b) => b.duration?._id === sharedTier._id)
    : all;
  const options = showAll || !sharedTier ? all : matching;
  const hiddenCount = all.length - matching.length;

  const selected = all.find((b) => b._id === batchId) ?? null;
  const batchHasNoDuration = Boolean(selected) && !selected!.duration;
  // Students (with a known tier) this batch will refuse.
  const predictedMismatch = selected?.duration
    ? registrations.filter(
        (r) => r.duration && r.duration._id !== selected.duration!._id,
      ).length
    : 0;

  const submit = (ids: string[]) => {
    if (!batchId || ids.length === 0) return;
    enroll(
      { batchId, registrationIds: ids },
      {
        onSuccess: (res) => {
          onEnrolled?.(res.data.enrolled.map((r) => r.registration));
          const hasNotes = res.data.enrolled.some(
            (r) => r.alreadyEnrolled || r.warning,
          );
          // Only a clean, note-free run closes with a toast — partial
          // failures always get the full breakdown.
          if (res.summary.failed === 0 && !hasNotes) {
            toast.success(
              `${res.summary.enrolled} student${
                res.summary.enrolled === 1 ? "" : "s"
              } enrolled into ${res.data.batch.name}`,
            );
            onClose();
            return;
          }
          setResult(res);
        },
      },
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (overCap) return;
    submit(registrations.map((r) => r._id));
  };

  const title = result
    ? "Enrolment results"
    : single
      ? "Enroll Applicant"
      : `Enroll ${count} Applicants`;
  const subtitle = result
    ? result.message
    : single
      ? `Assign ${applicantName(single)} to a batch`
      : "Assign the selected applicants to one batch";

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={<CheckCircle2 size={16} />}
      size="medium"
      footer={
        result ? (
          <button type="button" className="modal-submit" onClick={onClose}>
            Done
          </button>
        ) : (
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
              disabled={isPending || !batchId || overCap || batchHasNoDuration}
            >
              {isPending ? (
                <Spinner size={14} color="#fff" text="" />
              ) : single ? (
                "Enroll"
              ) : (
                `Enroll ${count}`
              )}
            </button>
          </>
        )
      }
    >
      {result ? (
        <EnrollResults
          result={result}
          nameOf={(id) => {
            const r = byId.get(id);
            return r ? applicantName(r) : "Unknown applicant";
          }}
          retrying={isPending}
          onRetry={submit}
          onShowDuration={
            onShowDuration
              ? (id) => {
                  onShowDuration(id);
                  onClose();
                }
              : undefined
          }
        />
      ) : (
        <form id="enroll-form" onSubmit={handleSubmit} className="form-grid">
          {overCap && (
            <div className="bf-note bf-note--warn col-1">
              <AlertTriangle size={14} />
              <span>
                You've selected {count} applicants. Up to {ENROLL_MAX_IDS} can
                be enrolled at once — deselect {count - ENROLL_MAX_IDS} to
                continue.
              </span>
            </div>
          )}

          {sharedTier ? (
            <div
              className="bf-note col-1"
              style={{
                background: "var(--color-accent-muted)",
                color: "var(--color-text-secondary)",
              }}
            >
              <Info size={14} />
              <span>
                {single ? "This student" : "These students"} paid for{" "}
                <strong>{durationLabel(sharedTier)}</strong> (
                {formatPrice(sharedTier.price)}). Only batches with that
                duration are listed.
              </span>
            </div>
          ) : (
            <div className="bf-note bf-note--warn col-1">
              <AlertTriangle size={14} />
              <span>
                {single ? "This registration predates" : "These registrations predate"}{" "}
                durations, so there is nothing to match against. Enrolment will
                go through with an advisory warning.
              </span>
            </div>
          )}

          <div className="form-group col-1">
            <label className="modal-label" htmlFor="enroll-batch">
              Batch <span>*</span>
            </label>
            <select
              id="enroll-batch"
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
                  {b.duration
                    ? ` (${durationLabel(b.duration)})`
                    : " (no duration set)"}
                </option>
              ))}
            </select>

            {!isLoading && options.length === 0 && (
              <span className="bf-hint bf-hint--error">
                No batch matches this duration yet. Create one with the same
                duration, or widen the list below.
              </span>
            )}

            {sharedTier && hiddenCount > 0 && (
              <button
                type="button"
                className="bf-hint enroll-link-btn"
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
                This batch has no duration set, so enrolment will be refused.
                Set the batch's duration before enrolling students into it.
              </span>
            </div>
          )}

          {!batchHasNoDuration && predictedMismatch > 0 && (
            <div className="bf-note bf-note--warn col-1">
              <AlertTriangle size={14} />
              <span>
                {selected!.name} is a {durationLabel(selected!.duration)}{" "}
                placement.{" "}
                {single ? "This student" : "These students"} paid for{" "}
                {durationLabel(sharedTier)} ({formatPrice(sharedTier?.price)}),
                so enrolment will be refused.
              </span>
            </div>
          )}
        </form>
      )}
    </CustomModal>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────

interface EnrollResultsProps {
  result: EnrollResponse;
  nameOf: (registrationId: string) => string;
  retrying: boolean;
  onRetry: (registrationIds: string[]) => void;
  onShowDuration?: (durationId: string) => void;
}

function EnrollResults({
  result,
  nameOf,
  retrying,
  onRetry,
  onShowDuration,
}: EnrollResultsProps) {
  const { summary, data } = result;

  // Group failures by reason so a long list stays readable.
  const groups = useMemo(() => {
    const map = new Map<string, FailedRow[]>();
    data.failed.forEach((row) => {
      const list = map.get(row.reason) ?? [];
      list.push(row);
      map.set(row.reason, list);
    });
    return [...map.entries()].sort(
      ([a], [b]) =>
        (REASON_ORDER.indexOf(a) + 1 || 99) - (REASON_ORDER.indexOf(b) + 1 || 99),
    );
  }, [data.failed]);

  const notes = data.enrolled.filter((r) => r.alreadyEnrolled || r.warning);

  return (
    <div className="enroll-results">
      <div className="enroll-results__summary">
        <div className="enroll-results__stat enroll-results__stat--ok">
          <strong>{summary.enrolled}</strong> enrolled
        </div>
        <div
          className={`enroll-results__stat${
            summary.failed ? " enroll-results__stat--fail" : ""
          }`}
        >
          <strong>{summary.failed}</strong> not enrolled
        </div>
        <div className="enroll-results__stat">
          into <strong>{data.batch.name}</strong>
        </div>
      </div>

      {groups.map(([reason, rows]) => {
        const info = REASONS[reason] ?? {
          title: reason.replace(/_/g, " ").toLowerCase(),
          hint: "",
        };
        // Mismatched rows can be regrouped by the tier they actually paid for.
        const paidTiers =
          reason === "DURATION_MISMATCH"
            ? [
                ...new Map(
                  rows
                    .map((r) => r.data?.paidDuration)
                    .filter((d): d is NonNullable<typeof d> => Boolean(d))
                    .map((d) => [d._id, d]),
                ).values(),
              ]
            : [];

        return (
          <section key={reason} className="enroll-results__group">
            <header className="enroll-results__group-head">
              <h4>
                {info.title} <span>({rows.length})</span>
              </h4>
              {info.hint && <p>{info.hint}</p>}
            </header>

            <ul className="enroll-results__list">
              {rows.map((row) => (
                <li key={row.registration}>
                  <span className="enroll-results__name">
                    {nameOf(row.registration)}
                  </span>
                  <span className="enroll-results__msg">{row.message}</span>
                </li>
              ))}
            </ul>

            {reason === "ENROLL_FAILED" && (
              <button
                type="button"
                className="enroll-results__action"
                onClick={() => onRetry(rows.map((r) => r.registration))}
                disabled={retrying}
              >
                <RefreshCw size={13} />
                {retrying ? "Retrying…" : "Try these again"}
              </button>
            )}

            {onShowDuration &&
              paidTiers.map((tier) => (
                <button
                  key={tier._id}
                  type="button"
                  className="enroll-results__action"
                  onClick={() => onShowDuration(tier._id)}
                >
                  <Filter size={13} />
                  Show {durationLabel(tier)} applicants
                </button>
              ))}
          </section>
        );
      })}

      {notes.length > 0 && (
        <section className="enroll-results__group enroll-results__group--note">
          <header className="enroll-results__group-head">
            <h4>
              Enrolled, with notes <span>({notes.length})</span>
            </h4>
          </header>
          <ul className="enroll-results__list">
            {notes.map((row) => (
              <li key={row.registration}>
                <span className="enroll-results__name">
                  {nameOf(row.registration)}
                </span>
                <span className="enroll-results__msg">
                  {row.warning ??
                    "Already had an internship from an earlier interrupted attempt — it was synced, not duplicated."}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
