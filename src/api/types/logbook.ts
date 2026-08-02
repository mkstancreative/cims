// ─── LogBook Types ────────────────────────────────────────────────────────────

export type LogBookStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "needs_revision";

export interface LogBookActivity {
  _id?: string;
  date: string;
  dayOfWeek?: string;
  activity: string;
  description: string;
  hoursSpent: number;
  skillsUsed: string[];
}

export interface LogBook {
  _id: string;
  student?: string;
  weekNumber: number;
  title: string;
  weekStartDate?: string;
  weekEndDate?: string;
  activities: LogBookActivity[];
  challengesFaced?: string;
  lessonsLearned?: string;
  nextWeekPlan?: string;
  status: LogBookStatus;
  industrialReview?: {
    rating?: number | null;
    comments?: string;
    reviewedAt?: string;
    approvalMethod?: string;
  };
  schoolReview?: {
    reviewedAt?: string;
    comments?: string;
  };
  aiFraudScore?: number;
  totalHours?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// ─── List (getAll) response ───────────────────────────────────────────────────

export interface LogBookListItem {
  _id: string;
  weekNumber: number;
  title: string;
  weekStartDate?: string;
  weekEndDate?: string;
  status: LogBookStatus;
  createdAt?: string;
  totalHours?: number;
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

export interface CreateLogBookPayload {
  weekNumber: number;
  title: string;
  activities: Omit<LogBookActivity, "_id">[];
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
