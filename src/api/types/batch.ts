// ─── Batch Types (FMC Clinical Placement) ─────────────────────────────────────

export type BatchStatus = "created" | "active" | "completed" | "archived";

export interface ITPeriod {
  name: string;
  startDate: string;
  endDate: string;
  duration?: number;
}

export interface BatchSupervisorRef {
  _id: string;
  staffId?: string;
  specialization?: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface BatchCurriculumLink {
  _id: string;
  order: number;
  curriculum:
    | string
    | {
        _id: string;
        name: string;
        description?: string;
      };
}

export interface Batch {
  _id: string;
  name: string;
  session: string;
  status: BatchStatus;
  itPeriod: ITPeriod;
  supervisor?: BatchSupervisorRef | null;
  quiz?: string | { _id: string; title: string } | null;
  curricula?: BatchCurriculumLink[];
  createdBy?: { _id: string; firstName?: string; lastName?: string } | string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface BatchStudentStats {
  total: number;
  placed: number;
  active: number;
  completed: number;
}

export interface BatchListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: Batch[];
}

export interface BatchDetailResponse {
  success: boolean;
  data: {
    batch: Batch;
    studentStats: BatchStudentStats;
  };
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface BatchPayload {
  name: string;
  session: string;
  itPeriod: {
    name: string;
    startDate: string; // "YYYY-MM-DD"
    endDate: string; // "YYYY-MM-DD"
  };
}

export interface BatchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BatchStatus | "";
  session?: string;
}

export interface ActivateBatchParams {
  id: string;
  activateStudents?: boolean;
}

export interface UpdateBatchPayload {
  id: string;
  data: Partial<BatchPayload>;
}

export interface AssignBatchSupervisorPayload {
  id: string;
  supervisorId: string;
}

export interface LinkBatchCurriculumPayload {
  id: string;
  curriculumId: string;
}

export interface ReorderBatchCurriculaPayload {
  id: string;
  curriculumIds: string[];
}

export interface AssignBatchQuizPayload {
  id: string;
  quizId: string;
}

export type Department = string;

export interface DepartmentsResponse {
  data: string[];
}
