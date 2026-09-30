import { useState, type FormEvent } from "react";
import { AlertTriangle, BookOpen, Clock, Info } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import {
  useCreateDuration,
  useDurations,
  useUpdateDuration,
} from "../../../hooks/useDurations";
import type { Duration } from "../../../api/types/duration";
import { durationLabel, formatPrice } from "../../../helpers/duration";
import "./BatchForm.css";

interface DurationFormProps {
  isOpen: boolean;
  onClose: () => void;
  editing?: Duration | null;
}

export default function DurationForm({
  isOpen,
  onClose,
  editing,
}: DurationFormProps) {
  const [form, setForm] = useState({
    minWeeks: editing ? String(editing.minWeeks) : "",
    maxWeeks: editing ? String(editing.maxWeeks) : "",
    price: editing ? String(editing.price) : "",
    // Logbook minimums — distinct subtopics, 0 = no gate (the default).
    minLogbook: String(editing?.minLogbook ?? 0),
    minLogbookApproved: String(editing?.minLogbookApproved ?? 0),
  });

  const { mutate: create, isPending: creating } = useCreateDuration();
  const { mutate: update, isPending: updating } = useUpdateDuration();
  // Display order is set by dragging rows, so a new tier just goes last.
  const { data: existing } = useDurations({ limit: 100 });
  const isPending = creating || updating;

  const set = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const minWeeks = Number(form.minWeeks);
  const maxWeeks = Number(form.maxWeeks);
  const price = Number(form.price);
  const nextSortOrder =
    (existing?.data ?? []).reduce(
      (max, d) => Math.max(max, d.sortOrder ?? 0),
      0,
    ) + 1;

  const rangeValid =
    Number.isInteger(minWeeks) &&
    Number.isInteger(maxWeeks) &&
    minWeeks >= 1 &&
    minWeeks <= 104 &&
    maxWeeks >= 1 &&
    maxWeeks <= 104 &&
    maxWeeks >= minWeeks;
  const priceValid = Number.isInteger(price) && price >= 0;

  const minLogbook = Number(form.minLogbook || 0);
  const minLogbookApproved = Number(form.minLogbookApproved || 0);
  const inRange = (n: number) => Number.isInteger(n) && n >= 0 && n <= 500;
  const logbookRangeValid = inRange(minLogbook) && inRange(minLogbookApproved);
  // Approved entries are a subset of submitted ones.
  const logbookOrderValid = minLogbookApproved <= minLogbook;
  const logbookValid = logbookRangeValid && logbookOrderValid;

  const canSubmit = rangeValid && priceValid && logbookValid;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // `label` is derived by the backend from the range — never send it.
    // `sortOrder` is left alone on edit so dragging stays the only thing that
    // moves a tier.
    // Both logbook minimums always go together — a partial update that
    // lowers one below the other's stored value is refused.
    const logbook = { minLogbook, minLogbookApproved };
    if (editing) {
      update(
        { id: editing._id, data: { minWeeks, maxWeeks, price, ...logbook } },
        { onSuccess: onClose },
      );
    } else {
      create(
        { minWeeks, maxWeeks, price, sortOrder: nextSortOrder, ...logbook },
        { onSuccess: onClose },
      );
    }
  };

  const previewLabel = rangeValid
    ? durationLabel({ _id: "", minWeeks, maxWeeks })
    : "—";

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Edit Duration" : "Add Duration"}
      subtitle={
        editing
          ? "Update this priced placement period"
          : "Create a priced placement period students can choose"
      }
      icon={<Clock size={16} />}
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
            form="duration-form"
            className="modal-submit"
            disabled={isPending || !canSubmit}
          >
            {isPending ? (
              <Spinner size={14} color="#fff" text="" />
            ) : editing ? (
              "Save Changes"
            ) : (
              "Create Duration"
            )}
          </button>
        </>
      }
    >
      <form id="duration-form" onSubmit={handleSubmit} className="form-grid">
        <div className="form-group col-2">
          <label className="modal-label">
            Minimum Weeks <span>*</span>
          </label>
          <input
            type="number"
            className="modal-input"
            placeholder="e.g. 13"
            min={1}
            max={104}
            step={1}
            value={form.minWeeks}
            onChange={(e) => set("minWeeks", e.target.value)}
            required
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label">
            Maximum Weeks <span>*</span>
          </label>
          <input
            type="number"
            className="modal-input"
            placeholder="e.g. 24"
            min={1}
            max={104}
            step={1}
            value={form.maxWeeks}
            onChange={(e) => set("maxWeeks", e.target.value)}
            required
          />
          {form.maxWeeks && form.minWeeks && !rangeValid && (
            <span className="bf-hint bf-hint--error">
              Maximum weeks must be greater than or equal to minimum weeks, and
              both must be between 1 and 104.
            </span>
          )}
        </div>

        <div className="form-group col-2">
          <label className="modal-label">
            Price (₦) <span>*</span>
          </label>
          <input
            type="number"
            className="modal-input"
            placeholder="e.g. 55000"
            min={0}
            step={1}
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            required
          />
          <span className="bf-hint">
            Whole naira, no kobo. {priceValid ? formatPrice(price) : ""}
          </span>
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Label</label>
          <div className="bf-computed">{previewLabel}</div>
          <span className="bf-hint">
            Derived from the range, never stored. It updates automatically when
            you change the weeks.
          </span>
        </div>

        <div className="section-title-divider col-1 df-divider">
          <BookOpen size={13} /> Logbook minimums
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Subtopics logged (minimum)</label>
          <input
            type="number"
            className="modal-input"
            placeholder="0"
            min={0}
            max={500}
            step={1}
            value={form.minLogbook}
            onChange={(e) => set("minLogbook", e.target.value)}
          />
          <span className="bf-hint">
            Distinct curriculum subtopics with a submitted entry before the
            student can be evaluated. 0 = no requirement.
          </span>
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Subtopics approved (minimum)</label>
          <input
            type="number"
            className="modal-input"
            placeholder="0"
            min={0}
            max={500}
            step={1}
            value={form.minLogbookApproved}
            onChange={(e) => set("minLogbookApproved", e.target.value)}
          />
          {!logbookRangeValid ? (
            <span className="bf-hint bf-hint--error">
              Whole numbers from 0 to 500.
            </span>
          ) : !logbookOrderValid ? (
            <span className="bf-hint bf-hint--error">
              Can't be more than the subtopics-logged minimum ({minLogbook}) —
              approved subtopics are a subset of logged ones.
            </span>
          ) : (
            <span className="bf-hint">
              Distinct subtopics with an approved entry. 0 = no requirement.
            </span>
          )}
        </div>

        <p className="df-count-note col-1">
          These count <strong>subtopics, not entries</strong> — five entries on
          one subtopic count once.
        </p>

        {minLogbook > 0 && (
          <div className="bf-note col-1 df-warn">
            <AlertTriangle size={14} />
            <span>
              Keep this below the number of subtopics in the smallest
              curriculum you link to a batch on this tier. If it asks for more
              subtopics than the curriculum has, nobody in that batch can be
              evaluated.
            </span>
          </div>
        )}

        <div className="bf-note col-1" style={{ background: "var(--color-accent-muted)", color: "var(--color-text-secondary)" }}>
          <Info size={14} />
          <span>
            Re-pricing is safe. The price is copied onto a registration at
            payment time, so changing it never rewrites what an existing
            student was charged.
          </span>
        </div>
      </form>
      <style>{`
        .df-divider{display:flex;align-items:center;gap:6px;margin-top:4px}
        .df-count-note{margin:-4px 0 0;font-size:12px;color:var(--color-text-muted)}
        .df-warn{background:rgba(202,138,4,.1);color:var(--color-text-secondary)}
        .df-warn svg{color:#ca8a04}
      `}</style>
    </CustomModal>
  );
}
