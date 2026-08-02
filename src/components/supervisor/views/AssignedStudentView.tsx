import React from "react";
import { User, BookOpen, Phone, Mail, BarChart2 } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { useStudentDetail } from "../../../hooks/useSchoolSupervisor";
import { formatDate } from "../../../helpers/utilities";
import "./AssignedStudentView.css";

// ─── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | number | null;
  icon?: React.ReactNode;
}) {
  return (
    <div className="asv-info-row">
      <span className="asv-info-label">
        {icon && <span className="asv-row-icon">{icon}</span>}
        {label}
      </span>
      <span className="asv-info-value">{value ?? "—"}</span>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="asv-section">
      <div className="asv-section-header">
        <span className="asv-section-icon">{icon}</span>
        <h3 className="asv-section-title">{title}</h3>
      </div>
      <div className="asv-section-body">{children}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="asv-stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="asv-stat-value" style={{ color }}>
        {value}
      </div>
      <div className="asv-stat-label">{label}</div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="asv-skeleton-wrap">
      <div className="asv-skel asv-skel--hero">
        <div className="asv-skel asv-skel--avatar" />
        <div className="asv-skel-lines">
          <div className="asv-skel asv-skel--line" />
          <div className="asv-skel asv-skel--line asv-skel--short" />
          <div className="asv-skel asv-skel--line asv-skel--xshort" />
        </div>
      </div>
      <div className="asv-skel-stats">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="asv-skel asv-skel--stat" />
        ))}
      </div>
      <div className="asv-skel-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="asv-skel asv-skel--card" />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface AssignedStudentViewProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
}

export default function AssignedStudentView({
  isOpen,
  onClose,
  studentId,
}: AssignedStudentViewProps) {
  const { data: response, isLoading } = useStudentDetail(studentId);

  const s = response?.data?.student;
  const stats = response?.data?.logbookStats;
  const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(
    /\/api(\/v\d+)?\/?$/,
    "",
  );

  const fullName = s ? `${s.user.firstName} ${s.user.lastName}` : "";
  const initials = s
    ? `${s.user.firstName[0]}${s.user.lastName[0]}`.toUpperCase()
    : "?";

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={isLoading ? "Loading…" : fullName}
      subtitle={s?.registrationNumber}
      icon={<User size={16} />}
      size="wide"
      placement="top"
    >
      {isLoading ? (
        <SkeletonLoader />
      ) : !s ? (
        <div className="asv-empty">
          <p>Student details could not be loaded.</p>
        </div>
      ) : (
        <div className="asv-content">
          {/* ── Profile Hero ── */}
          <div className="asv-hero">
            <div className="asv-avatar-wrap">
              {s.passportPhoto ? (
                <img
                  src={`${apiBase}${s.passportPhoto.startsWith("/") ? "" : "/"}${s.passportPhoto}`}
                  alt={fullName}
                  className="asv-avatar"
                />
              ) : (
                <div className="asv-avatar asv-avatar--fallback">
                  {initials}
                </div>
              )}
            </div>
            <div className="asv-hero-info">
              <h2 className="asv-name">{fullName}</h2>
              <p className="asv-reg">{s.registrationNumber}</p>
              <div className="asv-meta-row">
                <span className="asv-meta">
                  <Mail size={12} /> {s.user.email}
                </span>
                <span className="asv-meta">
                  <Phone size={12} /> {s.user.phone}
                </span>
              </div>
            </div>
            <div className="asv-hero-badge">
              <StatusBadge status={s.itStatus} />
            </div>
          </div>

          {/* ── Logbook Stats ── */}
          {stats && (
            <div className="asv-stats-grid">
              <StatCard
                label="Total Entries"
                value={stats.total}
                color="#3b82f6"
              />
              <StatCard
                label="Approved"
                value={stats.approved}
                color="#10b981"
              />
              <StatCard
                label="Submitted"
                value={stats.submitted}
                color="#f59e0b"
              />
              <StatCard
                label="Rejected"
                value={stats.rejected}
                color="#ef4444"
              />
            </div>
          )}

          {/* ── Detail Grid ── */}
          <div className="asv-grid">
            {/* Academic Details */}
            <Section title="Academic Details" icon={<BookOpen size={14} />}>
              <InfoRow
                label="Department"
                value={`${s.department.name} (${s.department.code})`}
              />
              <InfoRow
                label="Program"
                value={`${s.program.type} — ${s.program.level}`}
              />
              <InfoRow label="Session" value={s.session} />
              <InfoRow label="Batch" value={s.batch?.name} />
            </Section>

            {/* IT Period */}
            {s.itPeriod && (
              <Section title="IT Period" icon={<BarChart2 size={14} />}>
                <InfoRow
                  label="Start Date"
                  value={formatDate(s.itPeriod.startDate)}
                />
                <InfoRow
                  label="End Date"
                  value={formatDate(s.itPeriod.endDate)}
                />
                <InfoRow
                  label="Duration (weeks)"
                  value={s.itPeriod.expectedDuration}
                />
              </Section>
            )}

            {/* Guarantor */}
            {s.guarantor && (
              <Section title="Guarantor" icon={<User size={14} />}>
                <InfoRow label="Name" value={s.guarantor.name} />
                <InfoRow
                  label="Relationship"
                  value={s.guarantor.relationship}
                />
                <InfoRow label="Phone" value={s.guarantor.phone} />
                <InfoRow label="Address" value={s.guarantor.address} />
              </Section>
            )}
          </div>
        </div>
      )}
    </CustomModal>
  );
}
