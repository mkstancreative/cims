import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, BookOpen, Phone, Mail, Calendar, Award, History } from "lucide-react";
import { useStudentById } from "../../../hooks/useStudents";
import type { StudentDetail } from "../../../api/types/student";
import "./AdminStudentView.css";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { formatDate } from "../../../helpers/utilities";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="sv-info-row">
      <span className="sv-info-label">{label}</span>
      <span className="sv-info-value">{value ?? "—"}</span>
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
    <div className="sv-section">
      <div className="sv-section-header">
        <span className="sv-section-icon">{icon}</span>
        <h3 className="sv-section-title">{title}</h3>
      </div>
      <div className="sv-section-body">{children}</div>
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
    <div className="sv-stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="sv-stat-value" style={{ color }}>
        {value}
      </div>
      <div className="sv-stat-label">{label}</div>
    </div>
  );
}

export default function AdminStudentView() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: student, isLoading } = useStudentById(id);

  const s = student as StudentDetail | undefined;
  const stats = s?.logbookStats;
  const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(
    /\/api(\/v\d+)?\/?$/,
    "",
  );

  if (isLoading) {
    return (
      <div className="sv-loading">
        <div className="sv-skeleton sv-skeleton--avatar" />
        <div className="sv-skeleton sv-skeleton--line" />
        <div className="sv-skeleton sv-skeleton--line sv-skeleton--short" />
      </div>
    );
  }

  if (!s) {
    return (
      <div className="sv-empty">
        <p>Student not found.</p>
        <button
          className="dash-btn dash-btn--ghost"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>
    );
  }

  const fullName = `${s.user.firstName} ${s.user.lastName}`;
  const initials =
    `${s.user.firstName?.charAt(0) || ""}${s.user.lastName?.charAt(0) || ""}`.toUpperCase() ||
    "??";
  const batchName =
    s.batch && typeof s.batch === "object" ? s.batch.name : (s.batch ?? "—");
  const school = s.supervisors?.school;

  return (
    <div className="page-container">
      {/* ── Back ── */}
      <button className="sv-back" onClick={() => navigate("/admin/students")}>
        <ArrowLeft size={16} /> Students
      </button>

      {/* ── Profile Hero ── */}
      <div className="sv-hero">
        <div className="sv-avatar-wrap">
          {s.passportPhoto ? (
            <img
              src={`${apiBase}${s.passportPhoto.startsWith("/") ? "" : "/"}${s.passportPhoto}`}
              alt={fullName}
              className="sv-avatar"
            />
          ) : (
            <div className="sv-avatar sv-avatar--fallback">{initials}</div>
          )}
        </div>
        <div className="sv-hero-info">
          <h2 className="sv-name">{fullName}</h2>
          <p className="sv-reg">{s.registrationNumber}</p>
          <div className="sv-meta-row">
            <span className="sv-meta">
              <Mail size={12} /> {s.user.email}
            </span>
            <span className="sv-meta">
              <Phone size={12} /> {s.user.phone}
            </span>
          </div>
        </div>
        <div className="sv-hero-badge">
          <StatusBadge status={s.itStatus} />
        </div>
      </div>

      {/* ── Logbook Stats ── */}
      {stats && (
        <div className="sv-stats-grid">
          <StatCard label="Total Entries" value={stats.total} color="var(--color-slate)" />
          <StatCard label="Approved" value={stats.approved} color="var(--color-primary)" />
          <StatCard label="Submitted" value={stats.submitted} color="#f59e0b" />
          <StatCard label="Rejected" value={stats.rejected} color="#ef4444" />
        </div>
      )}

      <div className="sv-grid">
        {/* ── Academic Details ── */}
        <Section title="Academic Details" icon={<BookOpen size={15} />}>
          <InfoRow
            label="Department"
            value={`${s.department.name} (${s.department.code})`}
          />
          <InfoRow
            label="Program"
            value={`${s.program.type} — ${s.program.level}`}
          />
          <InfoRow label="Session" value={s.session} />
          <InfoRow label="Batch" value={batchName as string} />
          {s.professionalRegNumber && (
            <InfoRow label="Professional Reg No." value={s.professionalRegNumber} />
          )}
        </Section>

        {/* ── Personal Details ── */}
        <Section title="Personal Details" icon={<User size={15} />}>
          <InfoRow label="Gender" value={s.gender ? s.gender.charAt(0).toUpperCase() + s.gender.slice(1) : undefined} />
          <InfoRow label="Date of Birth" value={formatDate(s.dateOfBirth)} />
          <InfoRow label="State of Origin" value={s.stateOfOrigin} />
          <InfoRow label="Nationality" value={s.nationality} />
          <InfoRow label="Address" value={s.address} />
        </Section>

        {/* ── IT Period ── */}
        {s.itPeriod && (
          <Section title="IT Period" icon={<Calendar size={15} />}>
            <InfoRow
              label="Start Date"
              value={formatDate(s.itPeriod.startDate)}
            />
            <InfoRow label="End Date" value={formatDate(s.itPeriod.endDate)} />
            <InfoRow
              label="Duration (weeks)"
              value={s.itPeriod.expectedDuration}
            />
          </Section>
        )}

        {/* ── Curriculum Progress ── */}
        {s.curriculumProgress && (
          <Section title="Curriculum Progress" icon={<Award size={15} />}>
            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Approved Subtopics</span>
                <span style={{ color: "var(--color-text-primary)" }}>
                  {s.curriculumProgress.approvedSubtopics} / {s.curriculumProgress.totalSubtopics}
                </span>
              </div>
              <div style={{ width: "100%", height: 8, backgroundColor: "var(--color-bg-secondary)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                <div
                  style={{
                    width: `${s.curriculumProgress.percent}%`,
                    height: "100%",
                    backgroundColor: "var(--color-primary)",
                    borderRadius: 4,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
                <span>Completion</span>
                <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>{s.curriculumProgress.percent}%</span>
              </div>
            </div>
          </Section>
        )}

        {/* ── School Supervisor ── */}
        {school && (
          <Section title="Clinical Supervisor" icon={<User size={15} />}>
            <InfoRow
              label="Name"
              value={`${school.user.firstName} ${school.user.lastName}`}
            />
            <InfoRow label="Email" value={school.user.email} />
            <InfoRow label="Phone" value={school.user.phone} />
            <InfoRow label="Staff ID" value={school.staffId} />
            <InfoRow label="Specialization" value={school.specialization} />
          </Section>
        )}

        {/* ── Guarantor ── */}
        {s.guarantor && (
          <Section title="Guarantor" icon={<User size={15} />}>
            <InfoRow label="Name" value={s.guarantor.name} />
            <InfoRow label="Relationship" value={s.guarantor.relationship} />
            <InfoRow label="Phone" value={s.guarantor.phone} />
            <InfoRow label="Address" value={s.guarantor.address} />
          </Section>
        )}

        {/* ── Next of Kin ── */}
        {s.nextOfKin && (
          <Section title="Next of Kin" icon={<User size={15} />}>
            <InfoRow label="Name" value={s.nextOfKin.name} />
            <InfoRow label="Relationship" value={s.nextOfKin.relationship} />
            <InfoRow label="Phone" value={s.nextOfKin.phone} />
            <InfoRow label="Address" value={s.nextOfKin.address} />
          </Section>
        )}

        {/* ── Internship History ── */}
        {s.internships && s.internships.length > 0 && (
          <Section title="Internship History" icon={<History size={15} />}>
            <div style={{ padding: "4px 0" }}>
              {s.internships.map((history, idx) => (
                <div
                  key={history._id}
                  style={{
                    padding: "12px 18px",
                    borderBottom: idx === (s.internships?.length ?? 0) - 1 ? "none" : "1px solid var(--color-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>
                      {history.batch.name}
                    </span>
                    <StatusBadge status={history.itStatus} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-text-secondary)" }}>
                    <span>Session: {history.session}</span>
                    {history.isCurrent && (
                      <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>Active / Current</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
