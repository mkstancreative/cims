import type { Duration, DurationRef } from "../api/types/duration";

/** Whole naira, no kobo — prices are integers on this API. */
export function formatPrice(price?: number | null): string {
  if (price === undefined || price === null || Number.isNaN(price)) return "—";
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `₦${price.toLocaleString("en-NG")}`;
  }
}

/**
 * `label` is derived server-side and never stored, so render it directly.
 * This only fills the gap for a ref that arrived without one.
 */
export function durationLabel(duration?: DurationRef | Duration | null): string {
  if (!duration) return "—";
  if (duration.label) return duration.label;
  const { minWeeks, maxWeeks } = duration;
  if (minWeeks === undefined || maxWeeks === undefined) return "—";
  return minWeeks === maxWeeks
    ? `${minWeeks} weeks`
    : `${minWeeks} to ${maxWeeks} weeks`;
}

/** "13 to 24 weeks — ₦55,000", for a picker option. */
export function durationOptionLabel(duration: Duration): string {
  return `${durationLabel(duration)} — ${formatPrice(duration.price)}`;
}

export function durationId(duration?: DurationRef | null): string | null {
  return duration?._id ?? null;
}

/** The API computes the end date; this mirrors it so the admin sees it live. */
export function computeEndDate(startDate: string, weeks: number): string {
  if (!startDate || !weeks || weeks < 1) return "";
  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return "";
  start.setDate(start.getDate() + weeks * 7);
  return start.toISOString().slice(0, 10);
}

/** Today as "YYYY-MM-DD" — the earliest start date the API accepts. */
export function todayInput(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function isWeeksInRange(weeks: number, duration?: Duration | null) {
  if (!duration) return false;
  return weeks >= duration.minWeeks && weeks <= duration.maxWeeks;
}
