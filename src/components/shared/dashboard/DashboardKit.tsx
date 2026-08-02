import type { ReactNode } from "react";
import "./dashboard.css";

// ── Colour Presets ──────────────────────────────────────────────────────────
export type KpiColor =
  | "teal"
  | "purple"
  | "amber"
  | "blue"
  | "rose"
  | "green"
  | "slate";

const COLOR_MAP: Record<KpiColor, { bg: string; icon: string; bar: string }> = {
  teal: { bg: "rgba(13,148,136,.12)", icon: "#0d9488", bar: "#0d9488" },
  purple: { bg: "rgba(99,102,241,.12)", icon: "#6366f1", bar: "#6366f1" },
  amber: { bg: "rgba(245,158,11,.12)", icon: "#d97706", bar: "#f59e0b" },
  blue: { bg: "rgba(59,130,246,.12)", icon: "#3b82f6", bar: "#3b82f6" },
  rose: { bg: "rgba(244,63,94,.12)", icon: "#f43f5e", bar: "#f43f5e" },
  green: { bg: "rgba(16,185,129,.12)", icon: "#10b981", bar: "#10b981" },
  slate: { bg: "rgba(100,116,139,.12)", icon: "#64748b", bar: "#94a3b8" },
};

// ── KpiCard ──────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string | ReactNode;
  icon: ReactNode;
  color?: KpiColor;
  trend?: string;
  trendType?: "up" | "neutral" | "warn" | "danger";
  progress?: number; // 0-100 — shows bottom bar
  className?: string;
}

export function KpiCard({
  label,
  value,
  sub,
  icon,
  color = "teal",
  trend,
  trendType = "neutral",
  progress,
  className = "",
}: KpiCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className={`db-kpi ${className}`}>
      <div className="db-kpi__accent-bar" style={{ background: c.bar }} />
      <div className="db-kpi__top">
        <div
          className="db-kpi__icon"
          style={{ background: c.bg, color: c.icon }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`db-kpi__trend db-kpi__trend--${trendType}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className="db-kpi__value">{value}</div>
        <div className="db-kpi__label">{label}</div>
        {sub && <div className="db-kpi__sub">{sub}</div>}
      </div>
      {progress !== undefined && (
        <div className="db-kpi__bar-track">
          <div
            className="db-kpi__bar-fill"
            style={{ width: `${Math.min(progress, 100)}%`, background: c.bar }}
          />
        </div>
      )}
    </div>
  );
}

// ── ProgressRing ─────────────────────────────────────────────────────────────
interface ProgressRingProps {
  pct: number;
  color?: string;
  size?: number;
  stroke?: number;
}

export function ProgressRing({
  pct,
  color = "#0d9488",
  size = 108,
  stroke = 9,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = ((Math.min(pct, 100) / 100) * circ).toFixed(1);

  return (
    <svg
      className="db-ring-card__svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-surface-overlay)"
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
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

// ── InfoPanel ─────────────────────────────────────────────────────────────────
interface InfoRow {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}

interface InfoPanelProps {
  title: string;
  sub?: string;
  icon: ReactNode;
  iconColor?: KpiColor;
  rows: InfoRow[];
}

export function InfoPanel({
  title,
  sub,
  icon,
  iconColor = "teal",
  rows,
}: InfoPanelProps) {
  const c = COLOR_MAP[iconColor];
  return (
    <div className="db-panel">
      <div className="db-panel__header">
        <div
          className="db-panel__icon"
          style={{ background: c.bg, color: c.icon }}
        >
          {icon}
        </div>
        <div>
          <div className="db-panel__title">{title}</div>
          {sub && <div className="db-panel__sub">{sub}</div>}
        </div>
      </div>
      <div className="db-panel__rows">
        {rows.map((row, i) => (
          <div className="db-panel__row" key={i}>
            <span className="db-panel__row-label">
              {row.icon && row.icon}
              {row.label}
            </span>
            <span className="db-panel__row-value">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GradeBadge ────────────────────────────────────────────────────────────────
export function GradeBadge({ grade }: { grade: string }) {
  const key = grade?.toUpperCase() as "A" | "B" | "C" | "D" | "F";
  return <span className={`db-grade db-grade--${key}`}>{grade}</span>;
}

// ── SectionHead ───────────────────────────────────────────────────────────────
interface SectionHeadProps {
  title: string;
  sub?: string;
  icon: ReactNode;
  color?: KpiColor;
}

export function SectionHead({
  title,
  sub,
  icon,
  color = "teal",
}: SectionHeadProps) {
  const c = COLOR_MAP[color];
  return (
    <div className="db-section-head">
      <div
        className="db-section-head__icon"
        style={{ background: c.bg, color: c.icon }}
      >
        {icon}
      </div>
      <div>
        <div className="db-section-head__title">{title}</div>
        {sub && <div className="db-section-head__sub">{sub}</div>}
      </div>
    </div>
  );
}

// ── DashboardSkeleton ─────────────────────────────────────────────────────────
interface DashboardSkeletonProps {
  cards?: number;
  wide?: boolean;
}

export function DashboardSkeleton({
  cards = 6,
  wide = false,
}: DashboardSkeletonProps) {
  return (
    <div className="db-page">
      <div
        style={{
          height: 140,
          borderRadius: 20,
          background: "var(--color-surface-overlay)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div className={`db-kpi-grid${wide ? " db-kpi-grid--wide" : ""}`}>
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 110,
              borderRadius: 16,
              background: "var(--color-surface-overlay)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}

// ── DashboardBanner ───────────────────────────────────────────────────────────
interface DashboardBannerProps {
  greeting: string;
  name: string;
  meta: string;
  badge?: ReactNode;
  initials: string;
  gradient?: string;
  /** Optional element to replace the initials circle (e.g. progress ring overlay) */
  avatarOverlay?: ReactNode;
}

export function DashboardBanner({
  greeting,
  name,
  meta,
  badge,
  initials,
  gradient = "",
  avatarOverlay,
}: DashboardBannerProps) {
  return (
    <div className="db-banner" style={{ background: gradient }}>
      <div className="db-banner__left">
        <div className="db-banner__greeting">{greeting}</div>
        <div className="db-banner__name">{name}</div>
        <div className="db-banner__meta">{meta}</div>
        {badge && <span className="db-banner__badge">{badge}</span>}
      </div>
      <div className="db-banner__right" style={{ position: "relative" }}>
        {initials}
        {avatarOverlay}
      </div>
    </div>
  );
}

// ── DashboardError ─────────────────────────────────────────────────────────────
export function DashboardError({
  message = "Could not load dashboard. Please try again.",
}: {
  message?: string;
}) {
  return (
    <div
      style={{
        padding: 40,
        color: "var(--color-text-muted)",
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}
