import { useState } from "react";
import {
  FileText,
  Download,
  RefreshCw,
  Clock,
  Award,
  XCircle,
  CheckCircle,
} from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import Spinner from "../../components/ui/Spinner/Spinner";
import { CertificateRequestModal } from "../../components/student/view/CertificateRequestModal";
import Certificate from "../../components/student/view/Certificate/Certificate";
import { useCertificateStatus } from "../../hooks/useCertificate";
import { useCertificateDownload } from "../../hooks/useCertificateDownload";
import { useStudentDashboard } from "../../hooks/useDashboard";
import type { CertificateStatus } from "../../api/types/certificate";
import "./MyCertificate.css";

export default function MyCertificate() {
  const { data, isLoading } = useCertificateStatus();
  const { data: dashResp } = useStudentDashboard();
  const [requestOpen, setRequestOpen] = useState(false);
  const { certRef, downloadingCert, certData, handleDownloadCert } =
    useCertificateDownload();

  const internshipId = dashResp?.data?.internshipId;

  // The status endpoint returns { success, data: CertificateStatus }
  const status = (
    data && typeof data === "object" && "data" in data ? data.data : data
  ) as Partial<CertificateStatus> | undefined;

  const approval = status?.approvalStatus;
  const canDownload = Boolean(status?.canDownload);
  const hasRequest = Boolean(approval);

  // Status icon mapping
  const getStatusIcon = () => {
    switch (approval) {
      case "approved":
        return <Award size={24} />;
      case "rejected":
        return <XCircle size={24} />;
      default:
        return <Clock size={24} />;
    }
  };

  return (
    <div className="page-container cert-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="page-title">My Certificate</h2>
            <p className="page-sub">
              Request and download your placement certificate
            </p>
          </div>
        </div>
        <div className="page-header-right">
          {(!hasRequest || approval === "rejected") && (
            <AddButton
              text={
                approval === "rejected"
                  ? "Re-request Certificate"
                  : "Request Certificate"
              }
              onClick={() => setRequestOpen(true)}
              icon={<RefreshCw size={14} />}
            />
          )}
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 60, display: "flex", justifyContent: "center" }}>
          <Spinner size={28} color="var(--color-accent)" text="Loading status…" />
        </div>
      ) : !hasRequest ? (
        <div className="cert-empty-state">
          <div className="cert-empty-icon">
            <FileText size={28} />
          </div>
          <h3 className="cert-empty-title">No Certificate Requested Yet</h3>
          <p className="cert-empty-sub">
            Once you finalize your daily logbook entries and your supervisor submits your final evaluation, you can request your official SIWES IT placement certificate here.
          </p>
          <button
            type="button"
            className="cert-empty-btn"
            onClick={() => setRequestOpen(true)}
          >
            <RefreshCw size={15} />
            Request Certificate Now
          </button>
        </div>
      ) : (
        <div className="cert-status-card">
          {/* Card Header */}
          <div className="cert-status-header">
            <div className="cert-status-title-area">
              <div className={`cert-status-icon-wrap ${approval || "pending"}`}>
                {getStatusIcon()}
              </div>
              <div>
                <span className="cert-status-label">Request Status</span>
                <h4 className="cert-status-value-title">
                  {approval === "approved"
                    ? "Approved & Issued"
                    : approval === "rejected"
                      ? "Request Rejected"
                      : "Awaiting Admin Review"}
                </h4>
              </div>
            </div>
            <StatusBadge status={approval ?? "pending"} />
          </div>

          {/* Progress Steps Tracker */}
          <div className="cert-steps">
            <div className="cert-step completed">
              <div className="cert-step-dot">
                <CheckCircle size={14} />
              </div>
              <span className="cert-step-label">Submitted</span>
            </div>
            <div
              className={`cert-step ${
                approval === "approved"
                  ? "completed"
                  : approval === "rejected"
                    ? ""
                    : "active"
              }`}
            >
              <div className="cert-step-dot">
                {approval === "approved" ? <CheckCircle size={14} /> : "2"}
              </div>
              <span className="cert-step-label">Review</span>
            </div>
            <div className={`cert-step ${approval === "approved" ? "completed" : ""}`}>
              <div className="cert-step-dot">
                {approval === "approved" ? <CheckCircle size={14} /> : "3"}
              </div>
              <span className="cert-step-label">Issued</span>
            </div>
          </div>

          {/* Rejection block */}
          {approval === "rejected" && status?.rejectionReason && (
            <div className="cert-rejection-box">
              <div className="cert-rejection-title">Feedback from Admin</div>
              <p className="cert-rejection-reason">{status.rejectionReason}</p>
            </div>
          )}

          {/* Details Block */}
          <div className="cert-success-box">
            {status?.certificateNumber && (
              <div className="cert-detail-row">
                <span className="cert-detail-lbl">Certificate ID</span>
                <span className="cert-detail-val">{status.certificateNumber}</span>
              </div>
            )}
            <div className="cert-detail-row">
              <span className="cert-detail-lbl">Document Type</span>
              <span className="cert-detail-val">Official Placement Certificate</span>
            </div>
            {status?.issuedAt && (
              <div className="cert-detail-row">
                <span className="cert-detail-lbl">Date Issued</span>
                <span className="cert-detail-val">
                  {new Date(status.issuedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Action trigger */}
          <div className="cert-action-area">
            {approval === "approved" ? (
              <button
                type="button"
                className="cert-download-btn"
                disabled={!canDownload || downloadingCert}
                onClick={() => handleDownloadCert(canDownload)}
              >
                {downloadingCert ? (
                  <Spinner size={14} color="#fff" />
                ) : (
                  <>
                    <Download size={16} /> Download Certificate
                  </>
                )}
              </button>
            ) : approval === "rejected" ? (
              <button
                type="button"
                className="cert-re-request-btn"
                onClick={() => setRequestOpen(true)}
              >
                <RefreshCw size={14} />
                Submit New Request
              </button>
            ) : (
              <p
                style={{
                  fontSize: "13.5px",
                  color: "var(--color-text-muted)",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                Your request is currently being reviewed by the department heads. You will be notified once it is approved.
              </p>
            )}
          </div>
        </div>
      )}

      <CertificateRequestModal
        isOpen={requestOpen}
        onClose={() => setRequestOpen(false)}
        internshipId={internshipId}
      />

      {/* Off-screen certificate used only for PDF generation */}
      {certData && (
        <div style={{ position: "fixed", left: -10000, top: 0 }}>
          <Certificate
            ref={certRef}
            studentName={`${certData.user.firstName} ${certData.user.lastName}`}
            regNumber={certData.student.registrationNumber}
            department={certData.student.department.name}
            program={certData.student.program.type}
            level={
              certData.student.program.level?.toUpperCase().includes("HND")
                ? "HND"
                : "ND"
            }
            graduationYear={certData.graduationYear}
            graduationMonth={certData.graduationMonth}
            graduationDate={certData.graduationDate}
            placeOfIT={certData.placeOfIT}
            certificateNumber={certData.certificateNumber}
            issuedAt={certData.issuedAt}
            itStartDate={certData.student.batch?.itPeriod?.startDate}
            itEndDate={certData.student.batch?.itPeriod?.endDate}
          />
        </div>
      )}
    </div>
  );
}
