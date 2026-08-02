// ─── Institution Types ────────────────────────────────────────────────────────

export interface Institution {
  _id: string;
  name: string;
  code: string;
  address: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicInstitution {
  _id: string;
  name: string;
  code: string;
  address?: string;
}

export interface InstitutionListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: Institution[];
}

export interface PublicInstitutionListResponse {
  success: boolean;
  data: PublicInstitution[];
}

export interface CreateInstitutionPayload {
  name: string;
  code: string;
  address: string;
}

export interface UpdateInstitutionPayload {
  id: string;
  data: Partial<CreateInstitutionPayload> & { isActive?: boolean };
}

export interface ToggleInstitutionStatusPayload {
  id: string;
  isActive: boolean;
}

export interface InstitutionParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
