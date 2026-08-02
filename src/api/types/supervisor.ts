// ─── Supervisor Types (admin management) ──────────────────────────────────────

export interface SupervisorUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface Supervisor {
  _id: string;
  user: SupervisorUser;
  staffId?: string;
  specialization?: string;
  currentStudentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupervisorListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: Supervisor[];
}

export interface SupervisorParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateSupervisorPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  staffId?: string;
  specialization?: string;
}
