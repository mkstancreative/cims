import type { LogbookTargets } from "./logbook";

// ─── Evaluation Types ─────────────────────────────────────────────────────────

/**
 * `pending` — the supervisor hasn't submitted. `awaiting-quiz` — the
 * supervisor's half is done; waiting on the student's quiz score (the
 * evaluation is what opens the quiz). `completed` — the final grade landed.
 */
export type EvaluationStatus = "pending" | "awaiting-quiz" | "completed";

export interface EvaluationRatings {
  professionalism: number;
  technicalCompetence: number;
  communication: number;
  initiative: number;
}

export interface SubmitEvaluationPayload {
  ratings: EvaluationRatings;
  comments?: string;
  /**
   * Waivers for judgement-call gates, named by the verify report's
   * `confirmWith` (e.g. `acknowledgeIncompleteCurriculum`). Only literal
   * `true` counts.
   */
  [acknowledge: string]: unknown;
}

// ─── Evaluation preflight (`GET /evaluations/:studentId/verify`) ─────────────

export interface EvaluationCurriculumProgress {
  totalSubtopics: number;
  approvedSubtopics: number;
  /** Distinct subtopics with at least one non-draft entry. >= approved. */
  submittedSubtopics?: number;
  /** Approved-based. */
  percent: number;
}

/** The shared logbook-minimum shape — see `LogbookTargets`. */
export type EvaluationLogbookTargets = LogbookTargets;

/** Nothing the supervisor can do — submit stays disabled. */
export interface EvaluationBlocker {
  kind: "blocker";
  code:
    | "LOGBOOK_MINIMUM_NOT_MET"
    | "LOGBOOK_APPROVED_MINIMUM_NOT_MET"
    | "LOGBOOK_MINIMUM_UNREACHABLE"
    | "INTERNSHIP_NOT_STARTED"
    | "INTERNSHIP_ABANDONED"
    | "INVALID_STATUS_TRANSITION"
    | (string & {});
  status: number;
  message: string;
  data?: {
    curriculum?: EvaluationCurriculumProgress;
    logbookTargets?: EvaluationLogbookTargets;
  };
}

/** A judgement call the supervisor can waive with an acknowledgement flag. */
export interface EvaluationConfirmation {
  kind: "confirmation";
  code: "CURRICULUM_INCOMPLETE" | (string & {});
  status: number;
  message: string;
  /** The POST body flag that waives this. Send it as literal `true`. */
  acknowledge: string;
  /** What the supervisor is accepting. Show verbatim. */
  consequence: string;
  /** The only severity signal — always false. (`forfeitsFinalGrade` is gone.) */
  reversible: false;
  data?: {
    curriculum?: EvaluationCurriculumProgress;
    logbookTargets?: EvaluationLogbookTargets;
  };
}

/** Advisory only — never refuses anything. */
export interface EvaluationNotice {
  kind: "notice";
  code:
    | "WILL_FINALIZE"
    | "QUIZ_NOT_SCORED"
    | "NO_QUIZ_ASSIGNED"
    | "NO_CURRICULUM_LINKED"
    | "ALREADY_SUBMITTED"
    | (string & {});
  message: string;
  data?: { submittedAt?: string };
}

export type EvaluationVerdict = "ready" | "needs_confirmation" | "blocked";

export interface EvaluationVerifyReport {
  /** The one field to branch the UI on. */
  verdict: EvaluationVerdict;
  canSubmit: boolean;
  requiresConfirmation: boolean;
  /** Flags to send as `true`. Always [] unless requiresConfirmation. */
  confirmWith: string[];
  blockers: EvaluationBlocker[];
  confirmations: EvaluationConfirmation[];
  notices: EvaluationNotice[];
  context: {
    student: { _id: string; registrationNumber: string; name: string | null };
    internship: {
      _id: string;
      itStatus: "placed" | "active" | "completed" | "abandoned";
      batch: { _id: string; name: string; session: string } | null;
    };
    curriculum: EvaluationCurriculumProgress & { remainingSubtopics: number };
    /** Absent on older APIs. */
    logbookTargets?: EvaluationLogbookTargets;
    /** `assigned: false` with `scored: true` is valid — a score outlives its quiz. */
    quiz: {
      assigned: boolean;
      title: string | null;
      scored: boolean;
      score: number | null;
    };
    evaluation: {
      _id: string;
      status: EvaluationStatus;
      totalScore: number | null;
      submittedAt: string | null;
    } | null;
    /** Submitting now produces the final grade and completes the internship. */
    wouldFinalize: boolean;
  };
}

export interface EvaluationVerifyResponse {
  success: boolean;
  data: EvaluationVerifyReport;
}

export interface EvaluationVerifyParams {
  internshipId?: string;
  batchId?: string;
}

/** A refused `POST /evaluations/:studentId` — `code` is on every failure. */
export interface EvaluationSubmitError {
  success: false;
  code?: string;
  message: string;
  /** true = retry with `acknowledge` set to true. */
  requiresConfirmation?: boolean;
  acknowledge?: string;
  consequence?: string;
  data?: { curriculum?: EvaluationCurriculumProgress };
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

/**
 * `GET /evaluations/pending` — the supervisor's students still awaiting an
 * evaluation. The student comes either populated (`user` names) or flattened
 * (`name`, `department`), so both are optional.
 */
export interface PendingEvaluationsResponse {
  success: boolean;
  total?: number;
  data: Array<{
    _id?: string;
    student?: EvaluationStudentRef & {
      name?: string;
      /** Embedded `{ name, code }` on the student; older shapes send a string. */
      department?: string | { name?: string; code?: string | null };
    };
    batch?: { _id: string; name: string };
    itStatus?: string;
    schoolSubmitted?: boolean;
    needsEvaluation?: boolean;
    [key: string]: unknown;
  }>;
}

// ─── My evaluation (`GET /evaluations/my-evaluation`) ─────────────────────────
//
// Built around the two halves of the grade. (Replaces the old
// `{ evaluation, summary }` — those keys are gone.)

/** One rubric criterion. Rendered from the array — never hardcode the keys. */
export interface RubricCriterion {
  key: string;
  label: string;
  /** null = not assessed yet. Never coalesce to 0. */
  score: number | null;
  max: number;
  percent: number | null;
}

export type LetterGrade = "A" | "B" | "C" | "D" | "E" | "F";

export interface MyEvaluation {
  internshipId: string;
  itStatus: "placed" | "active" | "completed" | "abandoned";
  batch: { _id: string; name: string; session: string } | null;
  status: EvaluationStatus;
  isComplete: boolean;
  /** Ready-to-render: what's outstanding and whose move it is. */
  nextStep: string;
  supervisorAssessment: {
    submitted: boolean;
    submittedAt: string | null;
    /** The supervisor's name, or null if unresolvable. */
    assessedBy: string | null;
    score: number | null;
    maxScore: number;
    comments: string | null;
    breakdown: RubricCriterion[];
  };
  quiz: {
    scored: boolean;
    score: number | null;
    maxScore: number;
    submittedAt: string | null;
  };
  finalGrade: {
    available: boolean;
    score: number | null;
    grade: LetterGrade | null;
    formula: string;
    components: {
      label: string;
      score: number | null;
      weightPercent: number;
      received: boolean;
    }[];
  };
  /** Only while awaiting the quiz half; null otherwise. */
  projection: {
    basedOn: string;
    quizScoreNeededFor: {
      grade: string;
      /** Lowest quiz mark reaching the grade; null when out of reach. */
      quizScore: number | null;
      reachable: boolean;
      /** Already secured whatever they score (quizScore 0). */
      guaranteed: boolean;
    }[];
  } | null;
  gradeScale: { grade: string; minScore: number }[];
}

export interface MyEvaluationResponse {
  success: boolean;
  data: MyEvaluation;
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
  department?: string;    // case-insensitive department name
  batchId?: string;       // batch _id
  search?: string;        // registration number match
  status?: EvaluationStatus;
  grade?: "A" | "B" | "C" | "D" | "E" | "F";
  page?: number;
  limit?: number;
}
