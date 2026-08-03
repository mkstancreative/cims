import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useRequestCertificate } from "../../../hooks/useCertificate";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { toast } from "react-toastify";

interface CertificateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  internshipId?: string;
}

export const CertificateRequestModal: React.FC<
  CertificateRequestModalProps
> = ({ isOpen, onClose, internshipId }) => {
  const { mutate: request, isPending } = useRequestCertificate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internshipId) {
      toast.error("Internship ID not found. Cannot submit request.");
      return;
    }
    request(
      { internshipId },
      {
        onSuccess: (res) => {
          if (res?.success !== false) {
            onClose();
          }
        },
      },
    );
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Request IT Certificate"
      subtitle="Are you sure you want to request your placement certificate?"
      icon={<CheckCircle2 size={18} />}
      size="medium"
      footer={
        <>
          <button
            className="modal-cancel"
            type="button"
            onClick={() => onClose()}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className="modal-submit"
            type="submit"
            form="cert-request-form"
            disabled={isPending}
          >
            {isPending ? <Spinner size={14} color="#fff" /> : "Submit Request"}
          </button>
        </>
      }
    >
      <form id="cert-request-form" onSubmit={handleSubmit} style={{ padding: "8px 0" }}>
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-text-secondary)",
            margin: 0,
            lineHeight: "1.6",
            textAlign: "center",
          }}
        >
          Your request will be sent to the administration for approval. Please make sure all your logbooks are approved and evaluation is finalized before requesting.
        </p>
      </form>
    </CustomModal>
  );
};
