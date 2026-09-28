// ─── Internship Types ─────────────────────────────────────────────────────────

/**
 * `abandoned` is set by the server only — when a newer internship for the same
 * student is activated. It can't be sent; see `SettableInternshipStatus`.
 */
export type InternshipStatus = "placed" | "active" | "completed" | "abandoned";

/** The statuses `PUT /internships/:id/status` accepts. */
export type SettableInternshipStatus = Exclude<InternshipStatus, "abandoned">;

export interface InternshipBatchRef {
  _id: string;
  name: string;
  session?: string;
  status?: string;
  itPeriod?: {
    name: string;
    startDate: string;
    endDate: string;
    duration?: number;
  };
}

export interface InternshipSupervisorRef {
  _id: string;
  staffId?: string;
  specialization?: string;
  user?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface InternshipStudentRef {
  _id: string;
  registrationNumber?: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

export interface Internship {
  _id: string;
  student: string | InternshipStudentRef;
  batch?: string | InternshipBatchRef;
  session?: string;
  itStatus: InternshipStatus;
  supervisor?: string | InternshipSupervisorRef | null;
  isCurrent: boolean;
  itPeriod?: {
    startDate: string;
    endDate: string;
    expectedDuration?: number;
  };
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InternshipListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: Internship[];
}

export interface MyHistoryResponse {
  success: boolean;
  total: number;
  data: Internship[];
}

export interface InternshipParams {
  page?: number;
  limit?: number;
  status?: InternshipStatus | "";
  studentId?: string;
  batchId?: string;
  itStatus?: InternshipStatus | "";
  session?: string;
  program?: string;
  level?: string;
}

export interface UpdateInternshipStatusPayload {
  id: string;
  status: SettableInternshipStatus;
}

export interface UpdateInternshipStatusResponse {
  success: boolean;
  message?: string;
  data: Internship;
  /** Other active internships of this student closed as abandoned. */
  abandoned?: number;
}
