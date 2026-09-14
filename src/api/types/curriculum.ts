// ─── Curriculum Types ─────────────────────────────────────────────────────────

export interface Subtopic {
  _id?: string;
  title: string;
  description?: string;
  /**
   * Server-assigned and ZERO-BASED. The API re-numbers to `0…n-1` on save, so
   * this is a sort key, not a display number — the first item is `0`. Number
   * things for the reader off the array index instead.
   */
  order: number;
}

export interface Topic {
  _id?: string;
  title: string;
  description?: string;
  /** Server-assigned, zero-based. See `Subtopic.order`. */
  order: number;
  subtopics: Subtopic[];
}

export interface Curriculum {
  _id: string;
  name: string;
  description?: string;
  /** Already sorted by the API. Render as it comes — do not re-sort. */
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

/**
 * Array position IS the order.
 *
 * `order` is deliberately absent: the API falls back to array position when
 * it is omitted, and re-numbers to `0…n-1` on save regardless — so sending it
 * only creates a value that disagrees with what comes back.
 */
export interface SubtopicPayload {
  /**
   * MUST be echoed back for every subtopic being kept. A PUT replaces the
   * `topics` array wholesale and anything without an `_id` is created fresh
   * with a new one — which orphans the logbook entries tagged to the old id.
   */
  _id?: string;
  title: string;
  description?: string;
}

export interface TopicPayload {
  /** Echo back for every topic being kept. See `SubtopicPayload._id`. */
  _id?: string;
  title: string;
  description?: string;
  subtopics: SubtopicPayload[];
}

export interface CreateCurriculumPayload {
  name: string;
  description?: string;
  topics: TopicPayload[];
}

export interface UpdateCurriculumPayload {
  id: string;
  data: Partial<CreateCurriculumPayload>;
}

export interface CurriculumDetailResponse {
  success: boolean;
  data: Curriculum;
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
