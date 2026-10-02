// ─── LogBook Types ────────────────────────────────────────────────────────────

export type LogBookStatus =
  "draft" | "submitted" | "approved" | "rejected" | "needs_revision";

// ─── Curriculum references on an entry ────────────────────────────────────────
// The API may return these expanded or as raw ids — read them through the
// helpers in `helpers/logbook.ts` rather than touching the union directly.

export interface LogBookCurriculumRef {
  _id: string;
  name: string;
}

export interface LogBookTopicRef {
  _id: string;
  title: string;
  order?: number;
}

export interface LogBookSubtopicRef {
  _id: string;
  title: string;
  order?: number;
}

/** One day's entry, tied to a curriculum topic/subtopic rather than free text. */
export interface LogBookActivity {
  _id?: string;
  date: string;
  curriculum: string | LogBookCurriculumRef;
  topic: string | LogBookTopicRef;
  subtopic: string | LogBookSubtopicRef;
  notes: string;
  hoursSpent: number;
}

/**
 * What we SEND. Distinct from `LogBookActivity` because the request always
 * carries plain ids, while the response may carry populated documents.
 */
export interface LogBookActivityPayload {
  date: string;
  curriculum: string;
  topic: string;
  subtopic: string;
  notes: string;
  hoursSpent: number;
}

/** A flat single-activity logbook entry as returned by GET /logbooks/:id. */
export interface LogBook {
  _id: string;
  student?: string;
  internship?: string;
  curriculum: string;
  topic: string;
  subtopic: string;
  notes: string;
  hoursSpent: number;
  date: string;
  status: LogBookStatus;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// ─── List (getAll) response ───────────────────────────────────────────────────

/** One row in the GET /logbooks list response. */
export interface LogBookListItem {
  _id: string;
  /** `GET /logbooks` sends these populated; kept loose for older shapes. */
  curriculum: string | LogBookCurriculumRef;
  topic: string | LogBookTopicRef;
  subtopic: string | LogBookSubtopicRef;
  notes: string;
  hoursSpent: number;
  date: string;
  status: LogBookStatus;
  createdAt?: string;
}

export interface LogBookListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: LogBookListItem[];
}

export interface LogBookDetailResponse {
  success: boolean;
  data: LogBook;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

/**
 * POST /logbooks — create a single activity entry.
 * Only these six fields are accepted; the rest (weekNumber, title, reflections)
 * are not required by the API.
 */
export interface CreateLogBookEntryPayload {
  curriculum: string;
  topic: string;
  subtopic: string;
  notes: string;
  hoursSpent: number;
  date: string;
}

export interface CreateLogBookPayload {
  weekNumber: number;
  title: string;
  activities: LogBookActivityPayload[];
  challengesFaced?: string;
  lessonsLearned?: string;
  nextWeekPlan?: string;
}

export interface UpdateLogBookPayload extends CreateLogBookPayload {
  id: string;
}

export interface ManualLogbookApprovalResponse {
  success: boolean;
  message: string;
  data: {
    sent: boolean;
    message: string;
    supervisorEmail: string;
    expiresIn: string;
  };
}

export interface LogBookParams {
  page?: number;
  limit?: number;
  search?: string;
  weekNumber?: number | string;
  status?: LogBookStatus | "";
  /** Scope to one internship — `useLogBooks` sends the selected one's.
   *  Without these the list is the current internship's. */
  internshipId?: string;
  batchId?: string;
}
export interface FraudCheckResponse {
  success: boolean;
  message: string;
  data: {
    logbookId: string;
    weekNumber: number;
    fraudScore: number;
    passed: boolean;
    flags: Array<{
      reason: string;
      confidence: number;
    }>;
  };
}

// ─── Logbook minimums ─────────────────────────────────────────────────────────

/**
 * A batch duration tier's logbook floor and the student's position against
 * it — the same shape on the student's progress/dashboard, the supervisor's
 * evaluation verify report and the quiz lock.
 *
 * Counts are DISTINCT curriculum subtopics, never raw entries: ten entries on
 * one subtopic is one subtopic. A `0` threshold means that gate is off.
 */
export interface LogbookTargets {
  /** Subtopics needing a non-draft entry. */
  minLogbook: number;
  /** Subtopics needing an approved entry. Always <= minLogbook. */
  minLogbookApproved: number;
  submittedSubtopics: number;
  approvedSubtopics: number;
  totalSubtopics: number;
  minLogbookMet: boolean;
  minLogbookApprovedMet: boolean;
  /** false = the tier demands more subtopics than the curriculum has. */
  reachable: boolean;
  /** null when the batch has no duration tier — no requirement at all. */
  source: { _id: string; label: string } | null;
}
