import "./StatusBadge.css";
import { statusTone, type StatusTone } from "../../../helpers/status";

/** "needs_revision" → "Needs revision" */
function formatLabel(value: string): string {
  const text = value.replace(/[_-]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

interface StatusBadgeProps {
  status?: string | null;
  /** Older call sites pass the value under one of these names. */
  category?: string;
  type?: string;
  /** Text to show instead of the formatted status (e.g. "Processing"). */
  label?: string;
  /** Override the tone the status would get. */
  tone?: StatusTone;
  /** Tooltip. */
  title?: string;
  className?: string;
}

/**
 * The one status pill in the app: a dot, the label, a tinted background and a
 * matching text colour. The tone comes from `statusTone`; anything unknown
 * renders grey rather than breaking.
 */
function StatusBadge({
  status,
  category,
  type,
  label,
  tone,
  title,
  className,
}: StatusBadgeProps) {
  const value = status || category || type || "";
  if (!value && !label) return <>—</>;

  return (
    <span
      className={`status-badge status-badge--${tone ?? statusTone(value)}${
        className ? ` ${className}` : ""
      }`}
      title={title}
    >
      <span className="status-badge__dot" aria-hidden="true" />
      {label ?? formatLabel(value)}
    </span>
  );
}

export default StatusBadge;
