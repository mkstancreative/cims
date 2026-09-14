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

export interface MyQuizCurriculumProgress {
  totalSubtopics: number;
  approvedSubtopics: number;
  percent: number;
}

/**
 * Machine-readable lock reason. Branch on this, never on the message text.
 *
 * A student must clear three gates: curriculum complete, a sitting unlocked,
 * and marked present.
 */
export type QuizLockCode =
  | "CURRICULUM_INCOMPLETE"
  | "NO_SESSION"
  | "SESSION_NOT_UNLOCKED"
  | "NOT_MARKED_PRESENT"
  | "ALREADY_SUBMITTED";

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
    curriculum?: MyQuizCurriculumProgress;
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
  data?: { curriculum?: MyQuizCurriculumProgress };
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
