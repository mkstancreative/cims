// ── Student Dashboard API Types ───────────────────────────────────────────────

export interface StudentDashStudent {
  name: string;
  registrationNumber: string;
  department: string;
  program: string;
  itStatus: string;
  selfRegistered?: boolean;
}

export interface StudentDashPlacement {
  company: string;
  position: string;
  startDate: string;
}

export interface StudentDashSupervisors {
  industrial?: {
    name: string;
    email: string;
    phone: string;
  };
  school?: {
    department: string;
    specialization: string;
  };
}

export interface StudentDashCurriculumProgress {
  totalSubtopics: number;
  approvedSubtopics: number;
  percent: number;
}

export interface StudentDashProgress {
  daysRemaining: number;
  startDate: string;
  endDate: string;
  curriculum: StudentDashCurriculumProgress;
}

export interface StudentDashLogbooks {
  total: number;
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
}

export interface StudentDashEvaluation {
  status: string;
  industrialSubmitted: boolean;
  schoolSubmitted: boolean;
  isComplete: boolean;
  finalScore: number | null;
  finalGrade: string | null;
}

export interface StudentDashReport {
  generated: boolean;
  status: string;
  generatedAt: string | null;
  aiScore: number | null;
  aiGrade: string | null;
}

export interface StudentDashNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface StudentDashNotifications {
  unreadCount: number;
  latest: StudentDashNotification[];
}

export interface StudentDashBatch {
  _id: string;
  name: string;
  session: string;
  status: string;
  itPeriod?: {
    name: string;
    startDate: string;
    endDate: string;
    duration: number;
  };
}

export interface StudentDashSupervisor {
  name: string;
  specialization?: string;
}

export interface StudentDashboardData {
  internshipId: string;
  hasMultipleInternships: boolean;
  batch: StudentDashBatch;
  student: StudentDashStudent;
  supervisor?: StudentDashSupervisor | null;
  progress: StudentDashProgress;
  logbooks: StudentDashLogbooks;
  evaluation: unknown | null;
  notifications: StudentDashNotifications;
}

export interface StudentDashboardResponse {
  success: boolean;
  data: StudentDashboardData;
}

// ── Admin / Supervisor Dashboard API Types ────────────────────────────────────

export interface AdminDashStudents {
  total: number;
  uploaded: number;
  seekingPlacement: number;
  pendingVerification: number;
  placed: number;
  active: number;
  completed: number;
}

export interface AdminDashCompanies {
  total: number;
  pending: number;
  verified: number;
}

export interface AdminDashSupervisors {
  school: number;
  industrial: number;
}

export interface AdminDashLogbooks {
  pending: number;
  approved: number;
  rejected: number;
}

export interface AdminDashBatches {
  total: number;
  active: number;
}

export interface AdminDashboardData {
  students: AdminDashStudents;
  companies: AdminDashCompanies;
  supervisors: AdminDashSupervisors;
  logbooks: AdminDashLogbooks;
  batches: AdminDashBatches;
}

export interface AdminDashboardResponse {
  success: boolean;
  data: AdminDashboardData;
}

// ── School Supervisor Dashboard (actual API shape) ───────────────────────────

export interface SupervisorDashSupervisor {
  name: string;
  department: string;
  specialization: string;
  staffId: string;
  maxStudents: number;
  currentStudents: number;
  capacityPercent: number;
}

export interface SupervisorDashStudents {
  totalAssigned: number;
  active: number;
  placed: number;
  completed: number;
  needingEvaluation: number;
  departmentBreakdown?: Record<
    string,
    { total: number; active: number; completed: number }
  >;
}

export interface SupervisorDashLogbooks {
  pendingReview: number;
}

export interface SupervisorDashNotifications {
  unreadCount: number;
  latest: Array<{
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  }>;
}

export interface SupervisorDashboardData {
  supervisor: SupervisorDashSupervisor;
  students: SupervisorDashStudents;
  logbooks: SupervisorDashLogbooks;
  pendingEvaluations: unknown[];
  notifications: SupervisorDashNotifications;
}

export interface SupervisorDashboardResponse {
  success: boolean;
  data: SupervisorDashboardData;
}
