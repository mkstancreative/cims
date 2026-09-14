// ─── Batch Types (FMC Clinical Placement) ─────────────────────────────────────

import type { DurationRef } from "./duration";

export type BatchStatus =
  | "created"
  | "students_uploaded"
  | "in_progress"
  | "completed"
  | "archived"
  | "active";

export interface ITPeriod {
  name: string;
  startDate: string;
  /** Computed server-side as `startDate + weeks`. Never sent. */
  endDate: string;
  /**
   * The NUMBER OF WEEKS — not the priced tier. `batch.duration` is the tier
   * object; `batch.itPeriod.duration` is the length. Same word, two things:
   * the weeks stayed at this path because the activation job, certificates
   * and enrolment snapshots already read it.
   */
  duration?: number;
}

export interface BatchSupervisorRef {
  _id: string;
  staffId?: string;
  specialization?: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface BatchCurriculumLink {
  _id: string;
  /**
   * Zero-based, and guaranteed sorted, unique and gap-free `0…n-1` by every
   * add / reorder / remove response. Render the array as it comes and number
   * off the index — `order` is a sort key, not a label.
   */
  order: number;
  curriculum:
    | string
    | {
        _id: string;
        name: string;
        description?: string;
      };
}

export interface Batch {
  _id: string;
  name: string;
  session: string;
  status: BatchStatus;
  /** The priced tier. `null` on legacy batches until the backfill has run. */
  duration?: DurationRef | null;
  itPeriod: ITPeriod;
  supervisor?: BatchSupervisorRef | null;
  quiz?: string | { _id: string; title: string } | null;
  curricula?: BatchCurriculumLink[];
  createdBy?: { _id: string; firstName?: string; lastName?: string } | string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface BatchStudentStats {
  total: number;
  placed: number;
  active: number;
  completed: number;
}

export interface BatchListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: Batch[];
}

export interface BatchDetailResponse {
  success: boolean;
  data: {
    batch: Batch;
    studentStats: BatchStudentStats;
  };
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface BatchPayload {
  name: string;
  session: string;
  /** Required — must reference an ACTIVE duration, else the API answers 404. */
  durationId: string;
  /** Required — must fall inside the chosen tier's minWeeks…maxWeeks. */
  weeks: number;
  itPeriod: {
    name: string;
    /** "YYYY-MM-DD" — cannot be in the past (compared by day). */
    startDate: string;
    // endDate is deliberately absent: the API rejects it outright.
  };
}

export interface BatchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BatchStatus | "";
  session?: string;
}

export interface ActivateBatchParams {
  id: string;
  activateStudents?: boolean;
}

export interface ActivateBatchResponse {
  success: boolean;
  message?: string;
  data: {
    batchStatus: BatchStatus;
    placedBeforeActivation: number;
    newlyActivated: number;
    /** Students outside their IT period, skipped rather than activated. */
    skippedOutsidePeriod: number;
    alreadyActive: number;
  };
}

export interface BatchMutationResponse {
  success: boolean;
  message?: string;
  data: Batch;
}

export interface UpdateBatchPayload {
  id: string;
  data: Partial<BatchPayload>;
}

export interface AssignBatchSupervisorPayload {
  id: string;
  supervisorId: string;
}

export interface LinkBatchCurriculumPayload {
  id: string;
  curriculumId: string;
  /**
   * INSERT AT this position, zero-based — everything from here down shifts
   * one. Omit to append. Values past the end are clamped; negative is a 400.
   */
  order?: number;
}

export interface ReorderBatchCurriculaPayload {
  id: string;
  curriculumIds: string[];
}

export interface AssignBatchQuizPayload {
  id: string;
  quizId: string;
}

export type Department = string;

export interface DepartmentsResponse {
  data: string[];
}
