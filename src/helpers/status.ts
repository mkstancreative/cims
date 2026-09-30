// ─── Status tones ─────────────────────────────────────────────────────────────
//
// Every status value in the app maps to one tone; StatusBadge renders it. Add
// new status values here.

export type StatusTone =
  | "green" // live / good: active, approved, paid, present
  | "teal" // done: completed, uploaded
  | "amber" // waiting on someone: pending, submitted, in progress
  | "orange" // needs attention: needs revision, sitting open
  | "red" // stopped / bad: rejected, failed, absent, cancelled
  | "brand" // placed and waiting to start, unread
  | "grey"; // closed / archived / superseded / draft

const TONES: Record<string, StatusTone> = {
  // Live, good
  active: "green",
  approved: "green",
  success: "green",
  successful: "green",
  paid: "green",
  verified: "green",
  passed: "green",
  enabled: "green",
  present: "green",
  enrolled: "green",
  admitted: "green",
  unlocked: "green",
  available: "green",

  // Done
  completed: "teal",
  uploaded: "teal",
  students_uploaded: "teal",
  info: "teal",

  // Waiting
  pending: "amber",
  pending_payment: "amber",
  pending_verification: "amber",
  processing: "amber",
  submitted: "amber",
  in_progress: "amber",
  "in-progress": "amber",
  seeking_placement: "amber",
  awaiting: "amber",
  applied: "amber",
  new: "amber",
  locked: "amber",
  "awaiting-quiz": "amber",
  warning: "amber",

  // Needs attention
  needs_revision: "orange",
  open: "orange",

  // Stopped, bad
  rejected: "red",
  failed: "red",
  absent: "red",
  withdrawn: "red",
  cancelled: "red",
  reversed: "red",
  deactivated: "red",
  error: "red",

  // Placed (waiting to start), unread
  placed: "brand",
  unread: "brand",

  // Closed, archived, superseded, not started
  abandoned: "grey",
  archived: "grey",
  closed: "grey",
  ended: "grey",
  draft: "grey",
  created: "grey",
  inactive: "grey",
  disabled: "grey",
  read: "grey",
  refunded: "grey",
  no_quiz: "grey",
};

/** The tone a status renders in. */
export function statusTone(status?: string | null): StatusTone {
  return TONES[(status ?? "").toLowerCase()] ?? "grey";
}

