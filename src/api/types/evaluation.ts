// ─── Evaluation Types ─────────────────────────────────────────────────────────

export interface EvaluationRatings {
  professionalism: number;
  technicalCompetence: number;
  communication: number;
  initiative: number;
}

export interface SubmitEvaluationPayload {
  ratings: EvaluationRatings;
  comments?: string;
}

export interface EvaluationStudentRef {
  _id: string;
  registrationNumber?: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

export interface Evaluation {
  _id: string;
  student: string | EvaluationStudentRef;
  internship?: string;
  status: string;
  ratings?: EvaluationRatings;
  comments?: string;
  totalScore?: number;
  quizScore?: number;
  quizSubmittedAt?: string;
  finalScore?: number;
  finalGrade?: string;
  submittedBy?: string | { _id: string; firstName: string; lastName: string };
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PendingEvaluationsResponse {
  success: boolean;
  total?: number;
  data: Array<{
    _id: string;
    student?: EvaluationStudentRef;
    batch?: { _id: string; name: string };
    itStatus?: string;
    [key: string]: unknown;
  }>;
}

export interface MyEvaluationResponse {
  success: boolean;
  data: {
    evaluation: Evaluation | null;
    summary: {
      hasEvaluation: boolean;
      status?: string;
      isComplete?: boolean;
      finalScore?: number;
      finalGrade?: string;
    };
  };
}

export interface StudentEvaluationsResponse {
  success: boolean;
  data: Evaluation[];
}

export interface CompositeResultsResponse {
  success: boolean;
  total?: number;
  page?: number;
  pages?: number;
  data: Evaluation[];
}

export interface CompositeResultsParams {
  page?: number;
  limit?: number;
}
