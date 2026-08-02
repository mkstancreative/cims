// ─── Curriculum Types ─────────────────────────────────────────────────────────

export interface Subtopic {
  _id?: string;
  title: string;
  description?: string;
  order: number;
}

export interface Topic {
  _id?: string;
  title: string;
  description?: string;
  order: number;
  subtopics: Subtopic[];
}

export interface Curriculum {
  _id: string;
  name: string;
  description?: string;
  topics: Topic[];
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  batchCount?: number;
}

export interface CurriculumListItem {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  batchCount?: number;
}

export interface CurriculumListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: CurriculumListItem[];
}

export interface CreateCurriculumPayload {
  name: string;
  description?: string;
  topics: Array<{
    title: string;
    description?: string;
    order: number;
    subtopics: Array<{
      title: string;
      description?: string;
      order: number;
    }>;
  }>;
}

export interface UpdateCurriculumPayload {
  id: string;
  data: Partial<CreateCurriculumPayload>;
}

export interface CurriculumParams {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface MyCurriculumResponse {
  success: boolean;
  data: {
    curricula: Curriculum[];
  };
}
