// ─── Duration Types (priced placement periods) ────────────────────────────────
//
// A Duration is a priced placement period. It replaced the single flat
// registration fee, and a batch's end date is computed from it.
//
// These are a MENU, not a ladder: there is no ordering, prerequisite or
// progression. A student may pick any active duration at registration and any
// active one again on re-enrolment — including one they have already done.
// `sortOrder` is display order only.

export interface Duration {
  _id: string;
  minWeeks: number;
  maxWeeks: number;
  price: number;
  /**
   * Display order, ascending, with `minWeeks` as the tie-break — both list
   * endpoints already sort by it, so render as it comes.
   *
   * Unlike curriculum `order`, this is NOT re-numbered on save: the value you
   * set is the value you read back, and gaps are fine and intentional. That
   * is what lets the admin table reorder by reassigning the visible rows'
   * existing values without disturbing rows it cannot see.
   */
  sortOrder: number;
  /**
   * Derived server-side from the range ("13 to 24 weeks", or "6 weeks" when
   * min equals max). Render it directly — never rebuild it client-side and
   * never send it.
   */
  label: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** The tier as it arrives populated on a batch / registration. */
export interface DurationRef {
  _id: string;
  minWeeks?: number;
  maxWeeks?: number;
  price?: number;
  label?: string;
}

export interface PublicDurationListResponse {
  success: boolean;
  data: Duration[];
}

export interface DurationListResponse {
  success: boolean;
  total?: number;
  page?: number;
  pages?: number;
  data: Duration[];
}

export interface DurationParams {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateDurationPayload {
  minWeeks: number;
  maxWeeks: number;
  price: number;
  sortOrder?: number;
}

/** `isActive` is update-only — reactivating a retired tier is deliberate. */
export interface UpdateDurationPayload {
  id: string;
  data: Partial<CreateDurationPayload> & { isActive?: boolean };
}

/**
 * Create / update answer 200/201 with a non-blocking `warning` when week
 * ranges overlap. Surface it to the admin; it is not an error.
 */
export interface DurationMutationResponse {
  success: boolean;
  message?: string;
  warning?: string;
  data: Duration;
}

/** `409` body when a soft delete is refused because the tier is in use. */
export interface DurationInUse {
  liveBatches: number;
  openRegistrations: number;
}
