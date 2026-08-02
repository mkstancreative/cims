// ─── Shared / Base ───────────────────────────────────────

export interface Department {
  name: string;
}

export interface DepartmentDetail extends Department {
  code: string;
}

export interface Program {
  type: string;
  level: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface CompanyBase {
  _id: string;
  companyName: string;
}

export interface CompanyAddress {
  street: string;
  city: string;
  state: string;
}

export interface Company extends CompanyBase {
  address: CompanyAddress;
  phone: string;
  email: string;
  industry: string;
  companyType: "private" | "public" | "government";
  verificationStatus: "verified" | "pending" | "rejected";
  studentCount: number;
  currentStudents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface PlacementBase {
  company: CompanyBase;
  position: string;
}

export interface Placement extends Omit<PlacementBase, "company"> {
  company: Company;
  department: string;
  startDate: string;
  acceptanceLetterUrl: string;
  status: "verified" | "pending" | "rejected";
}

// ─── List Response ───────────────────────────────────────

export interface StudentSummary {
  _id: string;
  department: Department;
  program: Program;
  placement: PlacementBase;
  user: User;
  registrationNumber: string;
  itStatus: "active" | "inactive" | "completed";
}

export interface StudentsResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: StudentSummary[];
}

// ─── Detail Response ─────────────────────────────────────

export interface ITPeriod {
  startDate: string;
  endDate: string;
  expectedDuration: number;
}

export interface IndustrialSupervisor {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Supervisors {
  industrial: IndustrialSupervisor;
  school: string;
}

export interface Guarantor {
  name: string;
  relationship: string;
  phone: string;
  address: string;
}

export interface Batch {
  _id: string;
  name: string;
  session: string;
}

export interface StudentDetail {
  _id: string;
  department: DepartmentDetail;
  program: Program;
  itPeriod: ITPeriod;
  placement: Placement;
  supervisors: Supervisors;
  guarantor: Guarantor;
  user: User;
  registrationNumber: string;
  batch: Batch;
  session: string;
  itStatus: "active" | "inactive" | "completed";
  passportPhoto: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface LogbookStats {
  total: number;
  approved: number;
  submitted: number;
  rejected: number;
}

export interface StudentDetailResponse {
  success: boolean;
  data: {
    student: StudentDetail;
    logbookStats: LogbookStats;
  };
}

// ─── Supervisor Logbook Types ─────────────────────────────

export type LogbookStatus =
  | "submitted"
  | "approved"
  | "rejected"
  | "needs_revision"
  | "draft";

export interface LogbookIndustrialReview {
  rating?: number;
  comments?: string;
  reviewedAt?: string;
  approvalMethod?: string;
}

export interface LogbookSummary {
  _id: string;
  weekNumber: number;
  title: string;
  weekStartDate: string;
  weekEndDate: string;
  status: LogbookStatus;
  totalHours: number;
  createdAt: string;
  industrialReview?: LogbookIndustrialReview;
  schoolReview?: {
    reviewedAt?: string;
    comments?: string;
  };
}

export interface LogbookListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: LogbookSummary[];
}

export interface LogbookActivity {
  _id: string;
  date: string;
  activity: string;
  description: string;
  hoursSpent: number;
  skillsUsed: string[];
}

export interface LogbookDetail {
  _id: string;
  student: string;
  weekNumber: number;
  title: string;
  weekStartDate: string;
  weekEndDate: string;
  activities: LogbookActivity[];
  challengesFaced: string;
  lessonsLearned: string;
  nextWeekPlan: string;
  status: LogbookStatus;
  aiFraudScore: number;
  totalHours: number;
  createdAt: string;
  updatedAt: string;
  industrialReview?: LogbookIndustrialReview;
  schoolReview?: {
    reviewedAt?: string;
    comments?: string;
  };
  __v: number;
}

export interface LogbookStudent {
  _id: string;
  department: DepartmentDetail;
  program: Program;
  itPeriod: ITPeriod;
  placement: {
    company: string;
    position: string;
    department: string;
    startDate: string;
    acceptanceLetterUrl: string;
    status: string;
  };
  user: Pick<User, "_id" | "firstName" | "lastName">;
  registrationNumber: string;
  batch: string;
  session: string;
  itStatus: string;
  passportPhoto?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface LogbookDetailResponse {
  success: boolean;
  data: {
    logbook: LogbookDetail;
    student: LogbookStudent;
  };
}

export interface ReviewPayload {
  comments: string;
}

// ─── Evaluation Types ────────────────────────────────

export interface EvaluationStudent {
  _id: string;
  name: string;
  registrationNumber: string;
  department: string;
}

export interface PendingEvaluation {
  student: EvaluationStudent;
  itStatus: string;
  schoolSubmitted: boolean;
  industrialSubmitted: boolean;
  needsEvaluation: boolean;
}

export interface EvaluationListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: PendingEvaluation[];
}

export type EvaluationType = "midterm" | "final";

export interface EvaluationRequestPayload {
  studentIds: string[];
  type: EvaluationType;
}

export interface EvaluationRequestError {
  studentId: string;
  registrationNumber?: string;
  name?: string;
  error: string;
}

export interface EvaluationRequestResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    successful: number;
    failed: number;
    errors: EvaluationRequestError[];
  };
}

// ─── School Evaluation Submission ────────────────────────

export interface SchoolEvaluationRatings {
  logbookQuality: number; // max 40
  logbookConsistency: number; // max 30
  professionalGrowth: number; // max 30
}

export interface SchoolEvaluationPayload {
  ratings: SchoolEvaluationRatings;
  comments: string;
}

export interface SchoolEvaluationResponse {
  success: boolean;
  message: string;
  data: {
    student: string;
    type: string;
    schoolScore: number;
    finalScore: number;
    finalGrade: string;
    status: string;
  };
}
