import { useState, type FormEvent } from "react";
import { Info, RefreshCw } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useUpdateInternshipStatus } from "../../../hooks/useInternships";
import type {
  Internship,
  SettableInternshipStatus,
} from "../../../api/types/internship";
import { isAbandoned, studentName } from "../../../helpers/internship";

// `abandoned` is never offered — the server sets it and rejects it if sent.
const STATUS_OPTIONS: SettableInternshipStatus[] = [
  "placed",
  "active",
  "completed",
];

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
  // An abandoned internship has one way out: activating it again (restore).
  const abandoned = isAbandoned(internship.itStatus);
  const options: SettableInternshipStatus[] = abandoned
    ? ["active"]
    : STATUS_OPTIONS;
  const [status, setStatus] = useState<SettableInternshipStatus>(
    abandoned ? "active" : (internship.itStatus as SettableInternshipStatus),
  );
  const { mutate: update, isPending } = useUpdateInternshipStatus();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    update({ id: internship._id, status }, { onSuccess: onClose });
  };

  return (
    <>
    <style>{`
      .isf-note{display:flex;align-items:flex-start;gap:8px;margin:12px 0 0;padding:10px 12px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-slate-muted);font-size:12.5px;line-height:1.5;color:var(--color-text-secondary)}
      .isf-note svg{flex-shrink:0;margin-top:2px;color:var(--color-slate)}
    `}</style>
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={abandoned ? "Restore Internship" : "Update Internship Status"}
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
              abandoned ? "Restore Internship" : "Save Status"
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
            onChange={(e) => setStatus(e.target.value as SettableInternshipStatus)}
          >
            {options.map((s) => (
              <option key={s} value={s}>
                {abandoned
                  ? "Active (restore)"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {abandoned ? (
          <p className="isf-note">
            <Info size={14} />
            <span>
              This internship was closed when a newer one started. Restoring it
              makes it active again, and the student's currently active
              internship becomes abandoned instead.
            </span>
          </p>
        ) : (
          status === "active" &&
          internship.itStatus !== "active" && (
            <p className="isf-note">
              <Info size={14} />
              <span>
                Any other active internship for this student will be closed as
                abandoned.
              </span>
            </p>
          )
        )}
      </form>
    </CustomModal>
    </>
  );
}
