// ─── Quiz Session (attendance / roll call) Types ──────────────────────────────
//
// Attendance is taken before a batch sits its quiz. Staff open a *sitting*,
// mark who is physically present, then unlock — and only students marked
// present can take the quiz.

export type QuizSessionStatus = "open" | "unlocked" | "closed";

export interface QuizSessionStudentRef {
  _id: string;
  registrationNumber?: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

export interface QuizAttendanceRecord {
  _id?: string;
  student: string | QuizSessionStudentRef;
  internship: string | { _id: string };
  present: boolean;
  markedBy?:
    | string
    | { _id: string; firstName?: string; lastName?: string }
    | null;
  markedAt?: string | null;
}

export interface QuizSessionSummary {
  total: number;
  present: number;
  absent: number;
}

export interface QuizSession {
  _id: string;
  batch: string | { _id: string; name: string; session?: string };
  quiz?: string | { _id: string; title: string } | null;
  /** Increments per batch: 1, 2, 3… A later sitting serves students who
   *  missed the first. It does NOT grant a retake. */
  sitting: number;
  status: QuizSessionStatus;
  records: QuizAttendanceRecord[];
  summary?: QuizSessionSummary;
  openedBy?: { _id: string; firstName?: string; lastName?: string } | string;
  openedAt?: string;
  unlockedAt?: string | null;
  closedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizSessionListResponse {
  success: boolean;
  total?: number;
  page?: number;
  pages?: number;
  data: QuizSession[];
}

export interface QuizSessionDetailResponse {
  success: boolean;
  data: QuizSession;
}

export interface QuizSessionParams {
  batchId?: string;
  status?: QuizSessionStatus | "";
  page?: number;
  limit?: number;
}

export interface OpenQuizSessionPayload {
  batchId: string;
  /** Optional — defaults to the batch's assigned quiz. */
  quizId?: string;
}

/** Bulk — send the whole roll in one request. Keyed on internship id. */
export interface MarkAttendancePayload {
  id: string;
  records: Array<{ internshipId: string; present: boolean }>;
}

export interface MarkAttendanceResponse {
  success: boolean;
  message?: string;
  data: QuizSession & {
    /** Students enrolled after the sitting opened, added to the roll. */
    addedToRoll?: string[];
    /** Ids that don't belong to the batch — reported, not fatal. */
    notInThisBatch?: string[];
  };
}

/** `409` on open — a sitting is already live; navigate to it. */
export interface QuizSessionConflict {
  success: false;
  message: string;
  data?: { sessionId?: string };
}

/** `GET /quiz-sessions/my` — deliberately narrow, the student's own row only. */
export interface MyQuizSessionResponse {
  success: boolean;
  data: {
    session: {
      _id: string;
      quiz?: { _id?: string; title: string } | null;
      sitting: number;
      status: QuizSessionStatus;
    } | null;
    present?: boolean;
    markedAt?: string | null;
    message?: string;
  };
}

/** Max records the API accepts in one attendance call. */
export const MAX_ATTENDANCE_RECORDS = 1000;
