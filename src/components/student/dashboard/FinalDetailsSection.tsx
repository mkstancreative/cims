import React from "react";
import { Briefcase } from "lucide-react";
import type { StudentDashBatch, StudentDashSupervisor } from "../../../api/types/dashboard";

interface FinalDetailsSectionProps {
  batch: StudentDashBatch;
  itStatus: string;
  supervisor?: StudentDashSupervisor | null;
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
  batch,
  itStatus,
  supervisor,
  fmt,
}) => {
  const batchLabel = batch?.name ?? "—";
  const session = batch?.session ?? "—";
  const period = batch?.itPeriod;
  const supervisorName = supervisor?.name ?? "—";
  const supervisorSpecialization = supervisor?.specialization ?? "—";

  return (
    <div className="db-panels">
      <Panel
        icon={<Briefcase size={16} />}
        iconBg="rgba(59, 130, 246, 0.1)"
        iconColor="#3b82f6"
        title="Placement & Rotation Details"
        subtitle={batchLabel}
      >
        <Row label="Batch" value={batchLabel} />
        <Row label="Session" value={session} />
        <Row label="IT Rotation" value={period?.name ?? "—"} />
        <Row
          label="Status"
          value={
            <span style={{ textTransform: "capitalize" }}>
              {itStatus.replace(/_/g, " ")}
            </span>
          }
        />
        <Row
          label="Start Date"
          value={fmt(period?.startDate ?? null)}
        />
        <Row label="End Date" value={fmt(period?.endDate ?? null)} />
        <Row label="Supervisor" value={supervisorName} />
        {supervisor?.specialization && (
          <Row label="Specialization" value={supervisorSpecialization} />
        )}
      </Panel>
    </div>
  );
};
