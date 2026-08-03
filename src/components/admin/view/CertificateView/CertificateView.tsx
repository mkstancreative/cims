import React from "react";
import CustomModal from "../../../ui/CustomModal/CustomModal";
import type { AdminCertificateRequest } from "../../../../api/types/certificate";
import "./CertificateView.css";
import {
  User,
  GraduationCap,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
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
                <span className="item-label">Email Address</span>
                <span className="item-value">{req.user.email}</span>
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

export default CertificateView;
