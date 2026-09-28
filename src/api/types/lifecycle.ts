// ─── Deactivate vs. delete ────────────────────────────────────────────────────
//
// Curricula, quizzes, institutions and durations each have two removals:
//  - PATCH …/:id/status  sets `isActive` — reversible, the everyday control.
//  - DELETE …/:id        removes the document for good, and refuses (409)
//                        while anything still references it.
// A bare DELETE is NOT a soft delete any more. Always dry-run it first.

/** The four resources that share this contract. */
export type LifecycleResource = "quiz" | "curriculum" | "institution" | "duration";

/** `PATCH …/:id/status` — `data` is the full updated document. */
export interface StatusResponse<T = unknown> {
  success: true;
  /** "Quiz activated" | "Quiz deactivated" | … */
  message: string;
  data: T;
  /**
   * Present when deactivating something still in use (downstream impact), or
   * when reactivating a duration that overlaps another active one. Surface it
   * persistently — never as a flash.
   */
  warning?: string;
}

/** One path the delete guard checked. `count` is 0 for paths that are clear. */
export interface Dependency {
  /** "Batch", "QuizAttempt", … */
  model: string;
  /** The field holding the reference. */
  path: string;
  /** "batches", "submitted attempts", … */
  label: string;
  count: number;
}

/** `DELETE …/:id` (and its `?dryRun=true` preflight). */
export interface DeleteResponse {
  success: boolean;
  /** Safe to show verbatim — it already says what will happen / what blocks. */
  message: string;
  data: {
    dryRun: boolean;
    blocked: boolean;
    /** Sum across blocking paths. */
    total: number;
    /** e.g. "12 submitted attempts". */
    summary: string;
    /** EVERY path checked, zeros included — render `count > 0` as blockers. */
    dependencies: Dependency[];
    /** Dry runs and refusals. Branch on this, never on the status code. */
    wouldDelete?: boolean;
    /** Successful deletes. */
    deleted?: boolean;
    _id?: string;
  };
}

/** Duration only: a deactivation refused (409) because the tier is live. */
export interface DurationStillLive {
  liveBatches: number;
  openRegistrations: number;
}
