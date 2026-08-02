import { useState, type FormEvent } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useCreateBatch, useUpdateBatch } from "../../../hooks/useBatches";
import type { Batch, BatchPayload } from "../../../api/types/batch";
import { Layers } from "lucide-react";
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

function buildInitial(editing?: Batch | null): BatchPayload {
  if (editing) {
    return {
      name: editing.name,
      session: editing.session,
      itPeriod: {
        name: editing.itPeriod?.name ?? "",
        startDate: toDateInput(editing.itPeriod?.startDate),
        endDate: toDateInput(editing.itPeriod?.endDate),
      },
    };
  }
  return {
    name: "",
    session: "",
    itPeriod: { name: "", startDate: "", endDate: "" },
  };
}

export default function BatchForm({ isOpen, onClose, editing }: BatchFormProps) {
  const [form, setForm] = useState<BatchPayload>(() => buildInitial(editing));
  const { mutate: create, isPending: creating } = useCreateBatch();
  const { mutate: update, isPending: updating } = useUpdateBatch();
  const isPending = creating || updating;

  const set = (field: "name" | "session", value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setItPeriod = (field: "name" | "startDate" | "endDate", value: string) =>
    setForm((prev) => ({
      ...prev,
      itPeriod: { ...prev.itPeriod, [field]: value },
    }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      update({ id: editing._id, data: form }, { onSuccess: onClose });
    } else {
      create(form, { onSuccess: onClose });
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
            disabled={isPending}
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

        <div className="form-group col-2">
          <label className="modal-label">
            Period Name <span>*</span>
          </label>
          <input
            className="modal-input"
            placeholder="e.g. First Rotation"
            value={form.itPeriod.name}
            onChange={(e) => setItPeriod("name", e.target.value)}
            required
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label">
            Start Date <span>*</span>
          </label>
          <input
            type="date"
            className="modal-input"
            value={form.itPeriod.startDate}
            onChange={(e) => setItPeriod("startDate", e.target.value)}
            required
          />
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            End Date <span>*</span>
          </label>
          <input
            type="date"
            className="modal-input"
            value={form.itPeriod.endDate}
            onChange={(e) => setItPeriod("endDate", e.target.value)}
            required
          />
        </div>
      </form>
    </CustomModal>
  );
}
