import { useState, type FormEvent } from "react";
import { XCircle } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useRejectRegistration } from "../../../hooks/useRegistrations";
import type { Registration } from "../../../api/types/registration";
import { applicantName } from "../../../helpers/registration";

interface RejectRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration;
}

export default function RejectRegistrationForm({
  isOpen,
  onClose,
  registration,
}: RejectRegistrationFormProps) {
  const [reason, setReason] = useState("");
  const { mutate: reject, isPending } = useRejectRegistration();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    reject({ id: registration._id, reason }, { onSuccess: onClose });
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Application"
      subtitle={`Provide a reason for rejecting ${applicantName(registration)}`}
      icon={<XCircle size={16} />}
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
            form="reject-form"
            className="modal-submit"
            disabled={isPending || !reason.trim()}
          >
            {isPending ? <Spinner size={14} color="#fff" text="" /> : "Reject"}
          </button>
        </>
      }
    >
      <form id="reject-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="modal-label">
            Reason <span>*</span>
          </label>
          <textarea
            className="modal-input"
            rows={4}
            placeholder="e.g. Incomplete documentation"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
      </form>
    </CustomModal>
  );
}
