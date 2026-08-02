import { useState, type FormEvent } from "react";
import { Building2 } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import {
  useCreateInstitution,
  useUpdateInstitution,
} from "../../../hooks/useInstitutions";
import type { Institution } from "../../../api/types/institution";

interface InstitutionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editing?: Institution | null;
}

export default function InstitutionForm({
  isOpen,
  onClose,
  editing,
}: InstitutionFormProps) {
  const [form, setForm] = useState({
    name: editing?.name ?? "",
    code: editing?.code ?? "",
    address: editing?.address ?? "",
  });
  const { mutate: create, isPending: creating } = useCreateInstitution();
  const { mutate: update, isPending: updating } = useUpdateInstitution();
  const isPending = creating || updating;

  const set = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
      title={editing ? "Edit Institution" : "Add Institution"}
      subtitle={
        editing
          ? "Update the institution details below"
          : "Register a new institution"
      }
      icon={<Building2 size={16} />}
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
            form="institution-form"
            className="modal-submit"
            disabled={isPending}
          >
            {isPending ? (
              <Spinner size={14} color="#fff" text="" />
            ) : editing ? (
              "Save Changes"
            ) : (
              "Create Institution"
            )}
          </button>
        </>
      }
    >
      <form id="institution-form" onSubmit={handleSubmit} className="form-grid">
        <div className="form-group col-2">
          <label className="modal-label">
            Name <span>*</span>
          </label>
          <input
            className="modal-input"
            placeholder="e.g. Federal Medical Centre"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            Code <span>*</span>
          </label>
          <input
            className="modal-input"
            placeholder="e.g. FMC-001"
            value={form.code}
            onChange={(e) => set("code", e.target.value)}
            required
          />
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            Address <span>*</span>
          </label>
          <input
            className="modal-input"
            placeholder="Institution address"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            required
          />
        </div>
      </form>
    </CustomModal>
  );
}
