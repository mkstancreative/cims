import React from "react";
import CustomModal from "../../../ui/CustomModal/CustomModal";
import type { AdminCertificateRequest } from "../../../../api/types/certificate";
import "./CertificateView.css";
import {
  User,
  GraduationCap,
  CreditCard,
  FileText,
  MapPin,
  Calendar,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import StatusBadge from "../../../ui/StatusBadge/StatusBadge";
import { toast } from "react-toastify";
import {
  useBulkApproveCert,
  useBulkRejectCert,
  useCertDetails,
} from "../../../../hooks/useCertificate";

interface CertificateViewProps {
  id: string;
  onClose: () => void;
}

const CertificateView: React.FC<CertificateViewProps> = ({ id, onClose }) => {
  const { data: certResponse, isLoading } = useCertDetails(id);
  const req: AdminCertificateRequest | undefined = certResponse?.data;
  const approveMutation = useBulkApproveCert();
  const rejectMutation = useBulkRejectCert();

  const handleApprove = () => {
    if (!req?._id) return;

    approveMutation.mutate(
      { certificateIds: [req._id] },
      {
        onSuccess: (data) => {
          if (data?.success) {
            toast.success("Certificate request approved successfully.");
            onClose();
          }
        },
      },
    );
  };

  const handleReject = () => {
    if (!req?._id) return;

    rejectMutation.mutate(
      { certificateIds: [req._id] },
      {
        onSuccess: (data) => {
          if (data?.success) {
            toast.success("Certificate request rejected successfully.");
            onClose();
          }
        },
      },
    );
  };

  return (
    <CustomModal
      isOpen
      onClose={onClose}
      title={
        isLoading ? "Loading Request Details..." : "Certificate Request Details"
      }
      size="large"
      isLoading={isLoading}
    >
      {req && (
        <div className="cert-view-container">
          <div className="cert-view-grid">
            {/* Section 1: Student Details */}
            <div className="cert-view-section">
              <div className="section-header">
                <div className="section-icon">
                  <User size={18} />
                </div>
                <h5 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                  Student Profile
                </h5>
              </div>

              <div className="section-item">
                <span className="item-label">Full Name</span>
                <span className="item-value">
                  {req.user.firstName} {req.user.lastName}
                </span>
              </div>
              <div className="section-item">
                <span className="item-label">Registration No.</span>
                <span className="item-value">
                  {req.student.registrationNumber}
                </span>
              </div>
              <div className="section-item">
                <span className="item-label">Department</span>
                <span className="item-value">
                  {req.student.department.name}
                </span>
              </div>
              <div className="section-item">
                <span className="item-label">Program Type</span>
                <span className="item-value">
                  {req.student.program.type} ({req.student.program.level})
                </span>
              </div>
            </div>

            {/* Section 2: Graduation Info */}
            <div className="cert-view-section">
              <div className="section-header">
                <div className="section-icon">
                  <GraduationCap size={18} />
                </div>
                <h5 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                  Academic Info
                </h5>
              </div>

              <div className="section-item">
                <span className="item-label">Graduation Year</span>
                <span className="item-value">{req.graduationYear}</span>
              </div>
              <div className="section-item">
                <span className="item-label">Graduation Month</span>
                <span className="item-value">{req.graduationMonth}</span>
              </div>
              <div className="section-item">
                <span className="item-label">SIWES Organization</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    color: "#1e293b",
                    fontWeight: 600,
                  }}
                >
                  <MapPin size={12} /> {req.placeOfIT}
                </div>
              </div>
              <div className="section-item">
                <span className="item-label">Request Date</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    color: "#1e293b",
                    fontWeight: 600,
                  }}
                >
                  <Calendar size={12} />{" "}
                  {new Date(req.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Details */}
          <div className="cert-view-section" style={{ marginBottom: "24px" }}>
            <div className="section-header">
              <div className="section-icon">
                <CreditCard size={18} />
              </div>
              <h5 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                Financial Record
              </h5>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "20px",
              }}
            >
              <div
                className="section-item"
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 6,
                }}
              >
                <span className="item-label">Payment Status</span>
                <StatusBadge status={req.paymentStatus} />
              </div>
              <div
                className="section-item"
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 4,
                }}
              >
                <span className="item-label">Total Amount</span>
                <span className="item-value" style={{ fontSize: "18px" }}>
                  ₦{req.paymentAmount?.toLocaleString() || "0"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Document Verification */}
          <div className="cert-view-section">
            <div className="section-header">
              <div className="section-icon">
                <FileText size={18} />
              </div>
              <h5 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                Credential Verification
              </h5>
            </div>

            <div className="doc-grid">
              {req.documents.ndStatementOfResult && (
                <DocLink
                  label="ND Statement of Result"
                  url={req.documents.ndStatementOfResult.url}
                />
              )}
              {req.documents.hndStatementOfResult && (
                <DocLink
                  label="HND Statement of Result"
                  url={req.documents.hndStatementOfResult.url}
                />
              )}
              {req.documents.itDischargeLetter && (
                <DocLink
                  label="IT Discharge Letter"
                  url={req.documents.itDischargeLetter.url}
                />
              )}
            </div>
          </div>

          <div className="cert-view-actions">
            <button
              type="button"
              className="cert-action-btn cert-action-reject"
              onClick={handleReject}
              disabled={
                rejectMutation.isPending || req.approvalStatus !== "pending"
              }
            >
              <XCircle size={16} /> Reject
            </button>
            <button
              type="button"
              className="cert-action-btn cert-action-approve"
              onClick={handleApprove}
              disabled={
                approveMutation.isPending || req.approvalStatus !== "pending"
              }
            >
              <CheckCircle2 size={16} /> Approve
            </button>
          </div>
        </div>
      )}
    </CustomModal>
  );
};

function DocLink({ label, url }: { label: string; url: string }) {
  const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(
    /\/api(\/v\d+)?\/?$/,
    "",
  );
  const fullUrl = `${apiBase}/${url.startsWith("/") ? url.slice(1) : url}`;

  return (
    <a href={fullUrl} target="_blank" rel="noreferrer" className="doc-card">
      <div className="doc-card-icon">
        <FileText size={20} />
      </div>
      <span className="doc-card-label">{label}</span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginTop: 4,
          color: "#3b82f6",
          fontSize: "11px",
          fontWeight: 600,
        }}
      >
        View File <ExternalLink size={10} />
      </div>
    </a>
  );
}

export default CertificateView;
