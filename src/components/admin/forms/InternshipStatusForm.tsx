import { useState, type FormEvent } from "react";
import { RefreshCw } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useUpdateInternshipStatus } from "../../../hooks/useInternships";
import type {
  Internship,
  InternshipStatus,
} from "../../../api/types/internship";
import { studentName } from "../../../helpers/internship";

const STATUS_OPTIONS: InternshipStatus[] = ["placed", "active", "completed"];

interface InternshipStatusFormProps {
  isOpen: boolean;
  onClose: () => void;
  internship: Internship;
}

export default function InternshipStatusForm({
  isOpen,
  onClose,
  internship,
}: InternshipStatusFormProps) {
  const [status, setStatus] = useState<InternshipStatus>(internship.itStatus);
  const { mutate: update, isPending } = useUpdateInternshipStatus();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    update({ id: internship._id, status }, { onSuccess: onClose });
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Internship Status"
      subtitle={`Change status for ${studentName(internship)}`}
      icon={<RefreshCw size={16} />}
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
            form="internship-status-form"
            className="modal-submit"
            disabled={isPending || status === internship.itStatus}
          >
            {isPending ? (
              <Spinner size={14} color="#fff" text="" />
            ) : (
              "Save Status"
            )}
          </button>
        </>
      }
    >
      <form id="internship-status-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="modal-label">
            Status <span>*</span>
          </label>
          <select
            className="modal-input"
            value={status}
            onChange={(e) => setStatus(e.target.value as InternshipStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </form>
    </CustomModal>
  );
}
