import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useEnrollRegistration } from "../../../hooks/useRegistrations";
import { useBatches } from "../../../hooks/useBatches";
import type { Registration } from "../../../api/types/registration";
import { applicantName } from "../../../helpers/registration";

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
  const { data: batches, isLoading } = useBatches({ limit: 100 });
  const { mutate: enroll, isPending } = useEnrollRegistration();

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
      <form id="enroll-form" onSubmit={handleSubmit}>
        <div className="form-group">
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
            {batches?.data.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} — {b.session}
              </option>
            ))}
          </select>
        </div>
      </form>
    </CustomModal>
  );
}
