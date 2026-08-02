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

export interface MyQuizResponse {
  success: boolean;
  data: {
    quiz: StudentQuiz | null;
    locked: boolean;
    curriculum?: MyQuizCurriculumProgress;
    message?: string;
  };
}

export interface SubmitQuizPayload {
  answers: Array<{
    questionIndex: number;
    selectedOptionIndex: number;
  }>;
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
