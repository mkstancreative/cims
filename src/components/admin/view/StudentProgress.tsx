import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import { useStudentProgress } from "../../../hooks/useStudents";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { formatDate } from "../../../helpers/utilities";
import "./StudentProgress.css";
import "./AdminStudentView.css";

/** formatDate that never throws — returns '—' for invalid/missing values */
function safeDate(d?: string | null): string {
  if (!d) return "—";
  try {
    return formatDate(d);
  } catch {
    return "—";
  }
}

// ── Circular progress ring ────────────────────────────────────────────────────
function ProgressRing({
  percent,
  size = 130,
  stroke = 10,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  const color =
    percent >= 75 ? "#10b981" : percent >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          transform: "rotate(90deg)",
          transformOrigin: "center",
          fontSize: 22,
          fontWeight: 700,
          fill: color,
        }}
      >
        {percent}%
      </text>
    </svg>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="sp-stat" style={{ borderTop: `3px solid ${color}` }}>
      <div className="sp-stat-icon" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <div>
        <div className="sp-stat-value">{value}</div>
        <div className="sp-stat-label">{label}</div>
      </div>
    </div>
  );
}

// ── Missed weeks grid ─────────────────────────────────────────────────────────
function MissedWeeksGrid({
  missed,
  total,
  completed,
}: {
  missed: number[];
  total: number;
  completed: number;
}) {
  const missedSet = new Set(missed);
  return (
    <div className="sp-weeks-grid">
      {Array.from({ length: total }, (_, i) => i + 1).map((w) => {
        let status = "remaining";
        let label = "remaining";

        if (missedSet.has(w)) {
          status = "missed";
          label = "missed";
        } else if (w <= completed) {
          status = "ok";
          label = "submitted";
        }

        return (
          <div
            key={w}
            title={`Week ${w} — ${label}`}
            className={`sp-week-cell sp-week-${status}`}
          >
            {w}
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StudentProgress() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useStudentProgress(id);

  // Extract the API error message from the response body if present
  const apiErrorMessage = (() => {
    const e = error as { response?: { data?: { message?: string } } } | null;
    return e?.response?.data?.message ?? null;
  })();

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="sp-skeleton-hero" />
        <div className="sp-skeleton-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="sp-skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="page-container">
        <button className="sv-back" onClick={() => navigate("/admin/students")}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="sv-empty">
          <AlertTriangle size={40} color="#f59e0b" />
          <p style={{ fontWeight: 600, color: "var(--color-text-primary)", margin: "4px 0 0" }}>
            {apiErrorMessage ?? "Progress data not found."}
          </p>
          {apiErrorMessage && (
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "4px 0 0", textAlign: "center" }}>
              Make sure the student has an active internship assigned.
            </p>
          )}
        </div>
      </div>
    );
  }

  const { student, progress, logbookStats } = data;

  const requirementMet = logbookStats?.meetsRequirement ?? false;
  const missedWeeks = Array.isArray(logbookStats?.missedWeeks)
    ? logbookStats.missedWeeks
    : [];
  const percent = progress?.progressPercent ?? 0;
  const totalWeeks = progress?.totalWeeks ?? 0;
  const weeksCompleted = progress?.weeksCompleted ?? 0;
  const daysRemaining = progress?.daysRemaining ?? 0;

  return (
    <div className="page-container">
      {/* ── Back ── */}
      <button className="sv-back" onClick={() => navigate(`/admin/students`)}>
        <ArrowLeft size={16} /> Students
      </button>

      {/* ── Hero ── */}
      <div className="sp-hero">
        <div className="sp-hero-info">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <h2 className="sv-name">{student.name}</h2>
            <StatusBadge status={student.itStatus} />
          </div>
          <p className="sv-reg">{student.registrationNumber}</p>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "var(--color-text-secondary)",
            }}
          >
            {student.department} &bull; {student.program}
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: "var(--color-text-secondary)",
            }}
          >
            {student.email}
          </p>
        </div>

        {/* Progress Ring */}
        <div className="sp-ring-wrap">
          <ProgressRing percent={percent} />
          <p className="sp-ring-label">IT Progress</p>
        </div>
      </div>

      {/* ── Progress Stats ── */}
      <div className="sp-stats-grid">
        <StatCard
          label="Weeks Completed"
          value={`${weeksCompleted} / ${totalWeeks}`}
          icon={<Clock size={18} />}
          color="#3b82f6"
        />
        <StatCard
          label="Days Remaining"
          value={daysRemaining}
          icon={<CalendarDays size={18} />}
          color="#f59e0b"
        />
        <StatCard
          label="Start Date"
          value={safeDate(progress?.startDate)}
          icon={<CalendarDays size={18} />}
          color="#8b5cf6"
        />
        <StatCard
          label="End Date"
          value={safeDate(progress?.endDate)}
          icon={<CalendarDays size={18} />}
          color="#ec4899"
        />
      </div>

      <div className="sv-grid">
        {/* ── Logbook Stats ── */}
        <div className="sv-section">
          <div className="sv-section-header">
            <span className="sv-section-icon">
              <BookOpen size={15} />
            </span>
            <h3 className="sv-section-title">Logbook Summary</h3>
            <span style={{ marginLeft: "auto" }}>
              {requirementMet ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    color: "#10b981",
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle size={14} /> Meets requirement
                </span>
              ) : (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    color: "#ef4444",
                    fontWeight: 600,
                  }}
                >
                  <XCircle size={14} /> Below requirement
                </span>
              )}
            </span>
          </div>
          <div className="sv-section-body">
            <div className="sp-logbook-grid">
              <div className="sp-logbook-cell sp-logbook-total">
                <span className="sp-lb-val">{logbookStats.total}</span>
                <span className="sp-lb-lbl">Total</span>
              </div>
              <div className="sp-logbook-cell sp-logbook-approved">
                <span className="sp-lb-val">{logbookStats.approved}</span>
                <span className="sp-lb-lbl">Approved</span>
              </div>
              <div className="sp-logbook-cell sp-logbook-submitted">
                <span className="sp-lb-val">{logbookStats.submitted}</span>
                <span className="sp-lb-lbl">Submitted</span>
              </div>
              <div className="sp-logbook-cell sp-logbook-rejected">
                <span className="sp-lb-val">{logbookStats.rejected}</span>
                <span className="sp-lb-lbl">Rejected</span>
              </div>
            </div>

            <div className="sv-info-row">
              <span className="sv-info-label">Avg. Rating</span>
              <span className="sv-info-value">
                {logbookStats.averageRating > 0
                  ? `${logbookStats.averageRating.toFixed(1)} / 5`
                  : "—"}
              </span>
            </div>
            <div className="sv-info-row">
              <span className="sv-info-label">Min. Required</span>
              <span className="sv-info-value">
                {logbookStats.minimumRequired} weeks
              </span>
            </div>
            <div className="sv-info-row">
              <span className="sv-info-label">Missed Weeks</span>
              <span
                className="sv-info-value"
                style={{ color: "#ef4444", fontWeight: 600 }}
              >
                {missedWeeks.length}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Submission Heat Map ── */}
      <div className="sv-section">
        <div className="sv-section-header">
          <span
            className="sv-section-icon"
            style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}
          >
            <CalendarDays size={15} />
          </span>
          <h3 className="sv-section-title">Submission Heat Map</h3>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: "var(--color-text-secondary)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                background: "#ef4444",
                borderRadius: 2,
                marginRight: 4,
              }}
            />
            missed &nbsp;
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                background: "#10b981",
                borderRadius: 2,
                marginRight: 4,
              }}
            />
            submitted &nbsp;
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                background: "#1f2937",
                borderRadius: 2,
                marginRight: 4,
              }}
            />
            remaining
          </span>
        </div>
        <div style={{ padding: "16px 18px" }}>
          <MissedWeeksGrid
            missed={missedWeeks}
            total={totalWeeks}
            completed={weeksCompleted}
          />
        </div>
      </div>
    </div>
  );
}
