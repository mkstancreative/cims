import { useState, type FormEvent } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useCreateBatch, useUpdateBatch } from "../../../hooks/useBatches";
import { useDurations } from "../../../hooks/useDurations";
import type { Batch, BatchPayload } from "../../../api/types/batch";
import type { Duration } from "../../../api/types/duration";
import {
  computeEndDate,
  durationOptionLabel,
  formatPrice,
  isWeeksInRange,
  todayInput,
} from "../../../helpers/duration";
import { formatDate } from "../../../helpers/utilities";
import { AlertTriangle, Layers } from "lucide-react";
import "./BatchForm.css";

interface BatchFormProps {
  isOpen: boolean;
  onClose: () => void;
  editing?: Batch | null;
}

function toDateInput(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

interface FormState extends Omit<BatchPayload, "weeks"> {
  /** Kept as a string so the input can be emptied while typing. */
  weeks: string;
}

function buildInitial(editing?: Batch | null): FormState {
  if (editing) {
    return {
      name: editing.name,
      session: editing.session,
      durationId: editing.duration?._id ?? "",
      weeks: editing.itPeriod?.duration
        ? String(editing.itPeriod.duration)
        : "",
      itPeriod: {
        name: editing.itPeriod?.name ?? "",
        startDate: toDateInput(editing.itPeriod?.startDate),
      },
    };
  }
  return {
    name: "",
    session: "",
    durationId: "",
    weeks: "",
    itPeriod: { name: "", startDate: "" },
  };
}

export default function BatchForm({ isOpen, onClose, editing }: BatchFormProps) {
  const [form, setForm] = useState<FormState>(() => buildInitial(editing));
  const { mutate: create, isPending: creating } = useCreateBatch();
  const { mutate: update, isPending: updating } = useUpdateBatch();
  const { data: durationsResp, isLoading: loadingDurations } = useDurations({
    isActive: true,
    limit: 100,
  });
  const isPending = creating || updating;

  const durations: Duration[] = durationsResp?.data ?? [];
  const selected = durations.find((d) => d._id === form.durationId) ?? null;

  // The batch's own tier may already be retired; keep it visible while editing
  // so the admin isn't silently switched to a different price.
  const editingTier = editing?.duration;
  const showRetiredTier =
    editingTier?._id && !durations.some((d) => d._id === editingTier._id);

  const weeksNum = Number(form.weeks);
  const weeksValid =
    Number.isInteger(weeksNum) &&
    weeksNum > 0 &&
    (!selected || isWeeksInRange(weeksNum, selected));

  const today = todayInput();
  const originalStart = toDateInput(editing?.itPeriod?.startDate);
  // A running batch can still be edited — the past-date rule only bites when
  // the start date is actually changed.
  const startDateChanged = form.itPeriod.startDate !== originalStart;
  const minStartDate = editing && !startDateChanged ? undefined : today;
  const startInPast =
    Boolean(form.itPeriod.startDate) &&
    (!editing || startDateChanged) &&
    form.itPeriod.startDate < today;

  const periodLocked =
    editing?.status === "completed" || editing?.status === "archived";

  const computedEnd = weeksValid
    ? computeEndDate(form.itPeriod.startDate, weeksNum)
    : "";

  const periodChanged =
    Boolean(editing) &&
    (form.durationId !== (editing?.duration?._id ?? "") ||
      form.weeks !== String(editing?.itPeriod?.duration ?? "") ||
      startDateChanged);

  const set = (field: "name" | "session" | "weeks", value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setItPeriod = (field: "name" | "startDate", value: string) =>
    setForm((prev) => ({
      ...prev,
      itPeriod: { ...prev.itPeriod, [field]: value },
    }));

  const canSubmit =
    Boolean(form.name) &&
    Boolean(form.session) &&
    Boolean(form.durationId) &&
    weeksValid &&
    Boolean(form.itPeriod.startDate) &&
    !startInPast;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // `itPeriod.endDate` is deliberately never sent — the API rejects it and
    // computes the end date from the duration instead.
    const payload: BatchPayload = {
      name: form.name,
      session: form.session,
      durationId: form.durationId,
      weeks: weeksNum,
      itPeriod: {
        name: form.itPeriod.name,
        startDate: form.itPeriod.startDate,
      },
    };

    if (editing) {
      update({ id: editing._id, data: payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Edit Batch" : "Add New Batch"}
      subtitle={
        editing
          ? "Update batch details below"
          : "Fill in the details to create a new batch"
      }
      icon={<Layers size={16} />}
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
            form="batch-form"
            className="modal-submit"
            disabled={isPending || !canSubmit}
          >
            {isPending ? (
              <Spinner size={14} color="#fff" text="" />
            ) : editing ? (
              "Save Changes"
            ) : (
              "Create Batch"
            )}
          </button>
        </>
      }
    >
      <form id="batch-form" onSubmit={handleSubmit} className="form-grid">
        {/* ── Batch Name ── */}
        <div className="form-group col-2">
          <label className="modal-label">
            Batch Name <span>*</span>
          </label>
          <input
            className="modal-input"
            placeholder="e.g. Clinical Placement Batch A"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>

        {/* ── Session ── */}
        <div className="form-group col-2">
          <label className="modal-label">
            Session <span>*</span>
          </label>
          <input
            className="modal-input"
            placeholder="e.g. 2023/2024"
            value={form.session}
            onChange={(e) => set("session", e.target.value)}
            required
          />
        </div>

        {/* ── IT Period ── */}
        <div className="section-title-divider">IT Period</div>

        {periodLocked && (
          <div className="bf-note bf-note--warn col-1">
            <AlertTriangle size={14} />
            <span>
              This batch is {editing?.status}. Its period can no longer be
              changed.
            </span>
          </div>
        )}

        <div className="form-group col-2">
          <label className="modal-label">
            Duration <span>*</span>
          </label>
          <select
            className="modal-input"
            value={form.durationId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, durationId: e.target.value }))
            }
            required
            disabled={loadingDurations || periodLocked}
          >
            <option value="">
              {loadingDurations ? "Loading durations…" : "Select a duration"}
            </option>
            {showRetiredTier && (
              <option value={editingTier!._id}>
                {editingTier!.label ?? "Current duration"} (retired)
              </option>
            )}
            {durations.map((d) => (
              <option key={d._id} value={d._id}>
                {durationOptionLabel(d)}
              </option>
            ))}
          </select>
          {selected && (
            <span className="bf-hint">
              {formatPrice(selected.price)} · {selected.minWeeks}–
              {selected.maxWeeks} weeks
            </span>
          )}
        </div>

        <div className="form-group col-2">
          <label className="modal-label">
            Number of Weeks <span>*</span>
          </label>
          <input
            type="number"
            className="modal-input"
            placeholder={
              selected
                ? `${selected.minWeeks}–${selected.maxWeeks}`
                : "Select a duration first"
            }
            value={form.weeks}
            min={selected?.minWeeks ?? 1}
            max={selected?.maxWeeks ?? 104}
            step={1}
            onChange={(e) => set("weeks", e.target.value)}
            required
            disabled={!form.durationId || periodLocked}
          />
          {selected && form.weeks && !weeksValid && (
            <span className="bf-hint bf-hint--error">
              {weeksNum} week(s) is outside the "{selected.label}" duration.
              Choose a length between {selected.minWeeks} and {selected.maxWeeks}{" "}
              weeks.
            </span>
          )}
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Period Name</label>
          <input
            className="modal-input"
            placeholder="e.g. First Rotation"
            value={form.itPeriod.name}
            onChange={(e) => setItPeriod("name", e.target.value)}
          />
          <span className="bf-hint">
            Optional — defaults to "{form.name || "{batch name}"} Period".
          </span>
        </div>

        <div className="form-group col-2">
          <label className="modal-label">
            Start Date <span>*</span>
          </label>
          <input
            type="date"
            className="modal-input"
            value={form.itPeriod.startDate}
            min={minStartDate}
            onChange={(e) => setItPeriod("startDate", e.target.value)}
            required
            disabled={periodLocked}
          />
          {startInPast && (
            <span className="bf-hint bf-hint--error">
              Start date cannot be in the past.
            </span>
          )}
        </div>

        {/* End date is computed by the backend; showing it here is how the
            admin sees what they are committing to before they save. */}
        <div className="form-group col-2">
          <label className="modal-label">End Date</label>
          <div className="bf-computed">
            {computedEnd ? formatDate(computedEnd) : "—"}
          </div>
          <span className="bf-hint">
            Computed from the start date and number of weeks.
          </span>
        </div>

        {periodChanged && !periodLocked && (
          <div className="bf-note bf-note--warn col-1">
            <AlertTriangle size={14} />
            <span>
              Changing the duration, weeks or start date re-syncs every
              non-completed student in this batch to the new period.
            </span>
          </div>
        )}
      </form>
    </CustomModal>
  );
}
