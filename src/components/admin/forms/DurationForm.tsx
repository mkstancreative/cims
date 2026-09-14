import { useState, type FormEvent } from "react";
import { Clock, Info } from "lucide-react";
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
  const canSubmit = rangeValid && priceValid;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // `label` is derived by the backend from the range — never send it.
    // `sortOrder` is left alone on edit so dragging stays the only thing that
    // moves a tier.
    if (editing) {
      update(
        { id: editing._id, data: { minWeeks, maxWeeks, price } },
        { onSuccess: onClose },
      );
    } else {
      create(
        { minWeeks, maxWeeks, price, sortOrder: nextSortOrder },
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

        <div className="bf-note col-1" style={{ background: "var(--color-accent-muted)", color: "var(--color-text-secondary)" }}>
          <Info size={14} />
          <span>
            Re-pricing is safe. The price is copied onto a registration at
            payment time, so changing it never rewrites what an existing
            student was charged.
          </span>
        </div>
      </form>
    </CustomModal>
  );
}
