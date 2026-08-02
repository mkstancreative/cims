import { useState, type FormEvent } from "react";
import { UserRound } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useCreateSupervisor } from "../../../hooks/useSupervisors";

interface SupervisorFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupervisorForm({ isOpen, onClose }: SupervisorFormProps) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    staffId: "",
    specialization: "",
  });
  const { mutate: create, isPending } = useCreateSupervisor();

  const set = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    create(
      {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        staffId: form.staffId || undefined,
        specialization: form.specialization || undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Supervisor"
      subtitle="Register a new school supervisor"
      icon={<UserRound size={16} />}
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
            form="supervisor-form"
            className="modal-submit"
            disabled={isPending}
          >
            {isPending ? (
              <Spinner size={14} color="#fff" text="" />
            ) : (
              "Create Supervisor"
            )}
          </button>
        </>
      }
    >
      <form id="supervisor-form" onSubmit={handleSubmit} className="form-grid">
        <div className="form-group col-2">
          <label className="modal-label">
            First Name <span>*</span>
          </label>
          <input
            className="modal-input"
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            required
          />
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            Last Name <span>*</span>
          </label>
          <input
            className="modal-input"
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            required
          />
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            Email <span>*</span>
          </label>
          <input
            type="email"
            className="modal-input"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            Phone <span>*</span>
          </label>
          <input
            className="modal-input"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            required
          />
        </div>
        <div className="form-group col-2">
          <label className="modal-label">Staff ID</label>
          <input
            className="modal-input"
            value={form.staffId}
            onChange={(e) => set("staffId", e.target.value)}
          />
        </div>
        <div className="form-group col-2">
          <label className="modal-label">Specialization</label>
          <input
            className="modal-input"
            value={form.specialization}
            onChange={(e) => set("specialization", e.target.value)}
          />
        </div>
      </form>
    </CustomModal>
  );
}
