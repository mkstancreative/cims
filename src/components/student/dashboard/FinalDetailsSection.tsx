import React from "react";
import { Briefcase, Award } from "lucide-react";
import type {
  Internship,
  InternshipBatchRef,
  InternshipSupervisorRef,
} from "../../../api/types/internship";
import type { CertificateStatus } from "../../../api/types/certificate";

interface FinalDetailsSectionProps {
  internship?: Internship;
  certificate: CertificateStatus | null;
  fmt: (d: string | null) => string;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "13px",
      }}
    >
      <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function Panel({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="db-panel"
      style={{
        flex: 1,
        background: "var(--color-bg-secondary)",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            background: iconBg,
            color: iconColor,
            padding: "8px",
            borderRadius: "8px",
          }}
        >
          {icon}
        </div>
        <div>
          <h4
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            {title}
          </h4>
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {children}
      </div>
    </div>
  );
}

export const FinalDetailsSection: React.FC<FinalDetailsSectionProps> = ({
  internship,
  certificate,
  fmt,
}) => {
  const batch =
    internship?.batch && typeof internship.batch !== "string"
      ? (internship.batch as InternshipBatchRef)
      : undefined;
  const batchLabel =
    batch?.name ??
    (typeof internship?.batch === "string" ? internship.batch : "—");
  const session = internship?.session ?? batch?.session ?? "—";
  const period = internship?.itPeriod ?? batch?.itPeriod;
  const supervisor =
    internship?.supervisor && typeof internship.supervisor !== "string"
      ? (internship.supervisor as InternshipSupervisorRef)
      : undefined;
  const supervisorName = supervisor?.user
    ? `${supervisor.user.firstName} ${supervisor.user.lastName}`.trim()
    : (supervisor?.staffId ?? "—");

  const certLabel = certificate?.approvalStatus
    ? certificate.approvalStatus.charAt(0).toUpperCase() +
      certificate.approvalStatus.slice(1)
    : "Not Requested";

  return (
    <div className="db-panels">
      <Panel
        icon={<Briefcase size={16} />}
        iconBg="rgba(59, 130, 246, 0.1)"
        iconColor="#3b82f6"
        title="Internship Details"
        subtitle={batchLabel}
      >
        <Row label="Batch" value={batchLabel} />
        <Row label="Session" value={session} />
        <Row
          label="Status"
          value={
            <span style={{ textTransform: "capitalize" }}>
              {internship?.itStatus ?? "—"}
            </span>
          }
        />
        <Row
          label="Start Date"
          value={fmt(period?.startDate ?? null)}
        />
        <Row label="End Date" value={fmt(period?.endDate ?? null)} />
        <Row label="Supervisor" value={supervisorName} />
      </Panel>

      <Panel
        icon={<Award size={16} />}
        iconBg="rgba(13, 148, 136, 0.1)"
        iconColor="#0d9488"
        title="Certificate"
        subtitle="Completion certificate status"
      >
        <Row label="Status" value={certLabel} />
        <Row
          label="Available"
          value={certificate?.canDownload ? "Yes" : "No"}
        />
        {certificate?.certificateNumber && (
          <Row label="Cert. No." value={certificate.certificateNumber} />
        )}
      </Panel>
    </div>
  );
};
