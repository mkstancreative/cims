import type { LogbookTargets } from "./logbook";

// ─── Quiz Types ───────────────────────────────────────────────────────────────

export interface QuizQuestion {
  _id?: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passMark: number;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** `GET /quizzes/:id` — the full quiz, answers included (admin only). */
export interface QuizResponse {
  success: boolean;
  data: Quiz;
}

export interface QuizListItem {
  _id: string;
  title: string;
  description?: string;
  passMark: number;
  isActive: boolean;
  createdAt?: string;
  questionCount: number;
}

export interface QuizListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: QuizListItem[];
}

export interface CreateQuizPayload {
  title: string;
  description?: string;
  passMark: number;
  questions: Array<{
    /**
     * Echo it back on every question you're keeping. `PUT /quizzes/:id`
     * replaces the array wholesale, and a question sent without its `_id` is
     * recreated as a brand-new one with a new id.
     */
    _id?: string;
    text: string;
    options: string[];
    correctOptionIndex: number;
    points: number;
  }>;
}

export interface UpdateQuizPayload {
  id: string;
  data: Partial<CreateQuizPayload>;
}

/**
 * `PUT /quizzes/:id/questions/reorder`. Send EVERY question id, each exactly
 * once — array position is the new order. It only reorders; add, edit and
 * remove go through `PUT /quizzes/:id`. Ids come from the staff endpoint
 * (`GET /quizzes/:id`) — the student view strips them.
 */
export interface ReorderQuizQuestionsPayload {
  id: string;
  questionIds: string[];
}

export interface ReorderQuizQuestionsResponse {
  success: boolean;
  message: string;
  data: {
    quizId: string;
    /** Full question objects, in the new order — set state straight from it. */
    questions: QuizQuestion[];
  };
  /**
   * Present when students have already submitted: past attempts record
   * answers by position, so their per-question breakdown now describes the
   * wrong questions. Stored scores are unaffected. Always surface it.
   */
  warning?: string;
}

export interface QuizParams {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Student-facing question omits the correct answer.
export interface StudentQuizQuestion {
  _id?: string;
  text: string;
  options: string[];
  points: number;
}

export interface StudentQuiz {
  _id: string;
  title: string;
  description?: string;
  questions: StudentQuizQuestion[];
  passMark: number;
}

/**
 * Informational only — the curriculum no longer gates the quiz. Don't frame
 * it as the thing standing between the student and the paper.
 */
export interface MyQuizCurriculumProgress {
  totalSubtopics: number;
  approvedSubtopics: number;
  /** Distinct subtopics with a non-draft entry. */
  submittedSubtopics?: number;
  percent: number;
}

/**
 * Machine-readable lock reason. Branch on this, never on the message text.
 *
 * The quiz opens once the supervisor has submitted the evaluation AND the
 * student is marked present in an unlocked sitting. (`CURRICULUM_INCOMPLETE`
 * is gone — the curriculum no longer gates it.)
 */
export type QuizLockCode =
  /** The supervisor hasn't evaluated yet. Carries `logbookTargets`. */
  | "EVALUATION_NOT_SUBMITTED"
  /** The IT is already completed, so the quiz is closed. */
  | "INTERNSHIP_COMPLETED"
  | "NO_SESSION"
  | "SESSION_NOT_UNLOCKED"
  | "NOT_MARKED_PRESENT"
  /** Not a lock — a recorded result (409 on submit). Always wins. */
  | "ALREADY_SUBMITTED"
  /** 400 — the internship was closed when a newer one started. */
  | "INTERNSHIP_ABANDONED";

export interface MyQuizSessionRef {
  _id: string;
  sitting: number;
  status: "open" | "unlocked" | "closed";
}

export interface MyQuizResponse {
  success: boolean;
  data: {
    quiz: StudentQuiz | { _id: string; title: string } | null;
    locked?: boolean;
    code?: QuizLockCode;
    /** Absent on INTERNSHIP_ABANDONED. Informational only. */
    curriculum?: MyQuizCurriculumProgress;
    /** EVALUATION_NOT_SUBMITTED only — who the student is waiting on. */
    logbookTargets?: LogbookTargets;
    session?: MyQuizSessionRef | null;
    message?: string;
    alreadySubmitted?: boolean;
    score?: number;
    passed?: boolean;
  };
}

export interface SubmitQuizPayload {
  answers: Array<{
    questionIndex: number;
    selectedOptionIndex: number;
  }>;
}

/** A refused submit carries the same `code` as `GET /quizzes/my`. */
export interface SubmitQuizError {
  success: false;
  message: string;
  code?: QuizLockCode;
  data?: {
    curriculum?: MyQuizCurriculumProgress;
    /** On a 409 ALREADY_SUBMITTED — the recorded result, to show the score. */
    attempt?: { score?: number; passed?: boolean; [key: string]: unknown };
  };
}

export interface SubmitQuizResult {
  success: boolean;
  message?: string;
  data: {
    score: number;
    passed: boolean;
    attemptId: string;
    evaluationFinalized: boolean;
  };
}

// ─── Quiz summary (`GET /quizzes/my/summary`) ────────────────────────────────
//
// Dashboard-shaped and safe anywhere: never contains questions or options.
// Always 200 — locks and "no quiz" are states, not errors.

export type QuizSummaryState = "no_quiz" | "locked" | "available" | "submitted";

export interface QuizSummaryData {
  internshipId: string;
  itStatus: string;
  batch: { _id: string; name: string; session: string } | null;
  /** Ships in every state — the quiz is only half the final grade. */
  grade: {
    /** pending / awaiting-quiz / completed */
    evaluationStatus: string | null;
    evaluationSubmitted: boolean;
    supervisorScore: number | null;
    quizScore: number | null;
    finalScore: number | null;
    finalGrade: string | null;
  };
  state: QuizSummaryState;
  quiz: {
    _id: string;
    title: string;
    description: string | null;
    totalQuestions: number;
    totalPoints: number;
    /** Informational — the score feeds the grade, not the pass flag. */
    passMark: number;
  } | null;
  /** submitted only. `answered` is a COUNT; answers are never returned. */
  attempt: {
    _id: string;
    score: number;
    passed: boolean;
    submittedAt: string;
    answered: number;
  } | null;
  /** locked only — same codes as `/quizzes/my`, plus the gate's data. */
  lock: {
    code: QuizLockCode;
    message: string;
    curriculum?: MyQuizCurriculumProgress;
    session?: MyQuizSessionRef | null;
    logbookTargets?: LogbookTargets;
  } | null;
  /** A ready-to-render sentence saying whose move it is. */
  nextStep: string;
}

export interface QuizSummaryResponse {
  success: boolean;
  data: QuizSummaryData;
}
