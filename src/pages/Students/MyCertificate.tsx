import { useState } from "react";
import { FileText, Download, RefreshCw } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import Spinner from "../../components/ui/Spinner/Spinner";
import { CertificateRequestModal } from "../../components/student/view/CertificateRequestModal";
import Certificate from "../../components/student/view/Certificate/Certificate";
import { useCertificateStatus } from "../../hooks/useCertificate";
import { useCertificateDownload } from "../../hooks/useCertificateDownload";
import type { CertificateStatus } from "../../api/types/certificate";

export default function MyCertificate() {
  const { data, isLoading } = useCertificateStatus();
  const [requestOpen, setRequestOpen] = useState(false);
  const { certRef, downloadingCert, certData, handleDownloadCert } =
    useCertificateDownload();

  // The status endpoint returns { success, data: CertificateStatus }
  const status = (
    data && typeof data === "object" && "data" in data ? data.data : data
  ) as Partial<CertificateStatus> | undefined;

  const approval = status?.approvalStatus;
  const canDownload = Boolean(status?.canDownload);
  const hasRequest = Boolean(approval);

  return (
    <div className="page-container">
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
                approval === "rejected" ? "Re-request Certificate" : "Request Certificate"
              }
              onClick={() => setRequestOpen(true)}
              icon={<RefreshCw size={14} />}
            />
          )}
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
          <Spinner size={26} color="var(--color-accent)" text="Loading…" />
        </div>
      ) : !hasRequest ? (
        <div className="empty-state" style={{ padding: 40, textAlign: "center" }}>
          <p>You have not requested a certificate yet.</p>
          <p className="page-sub">
            Once your internship and evaluation are complete, request your
            certificate here.
          </p>
        </div>
      ) : (
        <div
          className="card"
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 640,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <strong>Approval status:</strong>
            <StatusBadge status={approval ?? "pending"} />
          </div>

          {status?.certificateNumber && (
            <div>
              <strong>Certificate number:</strong> {status.certificateNumber}
            </div>
          )}

          {approval === "rejected" && status?.rejectionReason && (
            <div style={{ color: "var(--color-danger, #dc2626)" }}>
              <strong>Reason:</strong> {status.rejectionReason}
            </div>
          )}

          {approval === "approved" && (
            <button
              className="btn-login"
              style={{ maxWidth: 240 }}
              disabled={!canDownload || downloadingCert}
              onClick={() => handleDownloadCert(canDownload)}
            >
              {downloadingCert ? (
                <Spinner size={14} color="#fff" />
              ) : (
                <>
                  <Download size={14} /> Download Certificate
                </>
              )}
            </button>
          )}
        </div>
      )}

      <CertificateRequestModal
        isOpen={requestOpen}
        onClose={() => setRequestOpen(false)}
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
