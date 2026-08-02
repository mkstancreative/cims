import type { Supervisor } from "./supervisor";
// ─── Student Types ────────────────────────────────────────────────────────────

export type ITStatus = "placed" | "active" | "completed";

export interface StudentUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface StudentBatchRef {
  _id: string;
  name: string;
  session: string;
}

export interface StudentDepartment {
  name: string;
  code: string;
}

export interface StudentProgram {
  type: string;
  level: string;
}

// ── List item (GET /admin/students) ──────────────────────────────────────────
export interface Student {
  _id: string;
  user: StudentUser;
  registrationNumber: string;
  batch: string | StudentBatchRef;
  session: string;
  itStatus: ITStatus;
  department: StudentDepartment;
  program: StudentProgram;
  passportPhoto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: Student[];
}

// ── Detail item (GET /admin/students/:id) ────────────────────────────────────

export interface PlacementCompany {
  _id: string;
  companyName: string;
  email: string;
  phone: string;
  industry: string;
  address: { street: string; city: string; state: string };
}

export interface StudentPlacement {
  company: PlacementCompany;
  position: string;
  department: string;
  startDate: string;
  acceptanceLetterUrl?: string;
  status: string;
}

export interface IndustrialSupervisor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  company: string;
  totalApprovals?: number;
}

export interface Guarantor {
  name: string;
  relationship: string;
  phone: string;
  address: string;
}

export interface LogbookStats {
  total: number;
  approved: number;
  submitted: number;
  rejected: number;
  missedWeeks: string[];
}

export interface NextOfKin {
  name: string;
  relationship: string;
  phone: string;
  address: string;
}

export interface InternshipHistoryItem {
  _id: string;
  batch: {
    _id: string;
    name: string;
    session: string;
  };
  session: string;
  itStatus: string;
  isCurrent: boolean;
  createdAt: string;
}

export interface StudentDetail extends Student {
  batch: StudentBatchRef;
  itPeriod: { startDate: string; endDate: string; expectedDuration: number };
  placement?: StudentPlacement;
  supervisors?: {
    industrial?: IndustrialSupervisor;
    school?: Supervisor;
  };
  guarantor?: Guarantor;
  nextOfKin?: NextOfKin;
  logbookStats?: LogbookStats;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  stateOfOrigin?: string;
  nationality?: string;
  professionalRegNumber?: string;
  curriculumProgress?: {
    totalSubtopics: number;
    approvedSubtopics: number;
    percent: number;
  };
  internships?: InternshipHistoryItem[];
}

export interface StudentDetailResponse {
  success: boolean;
  data: StudentDetail;
}

// ── Query Params ─────────────────────────────────────────────────────────────
export interface StudentParams {
  page?: number;
  limit?: number;
  search?: string;
  batch?: string;
  batchId?: string;
  department?: string;
  itStatus?: ITStatus | "";
  program?: string;
}

// ── Upload ───────────────────────────────────────────────────────────────────
export interface UploadStudentsPayload {
  batchId: string;
  file: File;
}

export interface BulkUploadError {
  row: string;
  error: string;
}

export interface BulkUploadResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    successful: number;
    failed: number;
    errors: BulkUploadError[];
  };
}
// ── Status Update ────────────────────────────────────────────────────────────
export interface StudentStatusUpdate {
  studentId: string;
  status: ITStatus;
}

export interface UpdateStudentStatusPayload {
  updates: StudentStatusUpdate[];
}

export interface UpdateStatusError {
  studentId: string;
  registrationNumber: string;
  currentStatus: ITStatus;
  error: string;
}

export interface UpdateStatusApiResult {
  success: boolean;
  message: string;
  data: {
    total: number;
    successful: number;
    failed: number;
    errors: UpdateStatusError[];
  };
}

// ── Progress ─────────────────────────────────────────────────────────────────
export interface ProgressInfo {
  weeksCompleted: number;
  daysRemaining: number;
  totalWeeks: number;
  progressPercent: number;
  startDate: string;
  endDate: string;
}

export interface ProgressLogbookStats {
  total: number;
  submitted: number;
  approved: number;
  rejected: number;
  missedWeeks: number[];
  averageRating: number;
  minimumRequired: number;
  meetsRequirement: boolean;
}

export interface ProgressPlacement {
  company: string;
  position: string;
  startDate: string;
}

export interface ProgressSupervisors {
  school?: string;
  industrial?: string;
}

export interface StudentProgressData {
  student: {
    _id: string;
    registrationNumber: string;
    name: string;
    email: string;
    department: string;
    program: string;
    itStatus: ITStatus;
  };
  progress: ProgressInfo;
  logbookStats: ProgressLogbookStats;
  placement?: ProgressPlacement;
  supervisors?: ProgressSupervisors;
}

export interface StudentProgressResponse {
  success: boolean;
  data: StudentProgressData;
}

// ── Assignment ───────────────────────────────────────────────────────────────
export interface AssignStudentsPayload {
  supervisorId: string;
  studentIds: string[];
}

export interface AssignStudentsResponse {
  success: boolean;
  message: string;
  data: {
    assignedCount: number;
    errors: Array<{
      studentId: string;
      registrationNumber?: string;
      error: string;
    }>;
  };
}
