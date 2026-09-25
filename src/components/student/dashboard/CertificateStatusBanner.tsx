import React from "react";
import { GraduationCap } from "lucide-react";
import type { CertificateStatus } from "../../../api/types/certificate";

interface CertificateStatusBannerProps {
  certificate: CertificateStatus | null;
  loadingCert: boolean;
}

const STATUS_TEXT: Record<string, { label: string; color: string; sub: string }> =
  {
    approved: {
      label: "Approved",
      color: "var(--color-primary)",
      sub: "Your certificate has been approved.",
    },
    rejected: {
      label: "Rejected",
      color: "#ef4444",
      sub: "Your certificate request was not approved.",
    },
    pending: {
      label: "Processing",
      color: "var(--color-accent)",
      sub: "Awaiting administrative review.",
    },
  };

export const CertificateStatusBanner: React.FC<
  CertificateStatusBannerProps
> = ({ certificate, loadingCert }) => {
  // Only show once the student has actually requested a certificate.
  if (loadingCert || !certificate || !certificate.requestId) {
    return null;
  }

  const status = certificate.approvalStatus || "pending";
  const meta = STATUS_TEXT[status] ?? STATUS_TEXT.pending;
  const sub =
    status === "rejected" && certificate.rejectionReason
      ? `Reason: ${certificate.rejectionReason}`
      : meta.sub;

  return (
    <div
      className="certificate-status-banner no-blur"
      style={{
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          background: "var(--color-accent-soft)",
          color: "var(--color-accent)",
          padding: "8px",
          borderRadius: "8px",
        }}
      >
        <GraduationCap size={20} />
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: "14px" }}>
          <span style={{ color: "var(--color-text-primary)" }}>
            Certificate Status:{" "}
          </span>
          <span style={{ color: meta.color }}>{meta.label}</span>
        </div>
        <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
          {sub}
        </div>
      </div>
    </div>
  );
};
