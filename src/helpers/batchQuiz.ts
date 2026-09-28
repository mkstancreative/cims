import type { Batch } from "../api/types/batch";

/** The quiz id on a batch — `quiz` may arrive populated or as a bare id. */
export function batchQuizId(batch: Batch): string | null {
  const q = batch.quiz;
  if (!q) return null;
  return typeof q === "string" ? q : q._id;
}

/**
 * The quiz title on a batch, falling back to a lookup of loaded quizzes when
 * the batch only carries the id. Null when no quiz is assigned.
 */
export function batchQuizTitle(
  batch: Batch,
  lookup: Map<string, string>,
): string | null {
  const q = batch.quiz;
  if (!q) return null;
  if (typeof q !== "string" && q.title) return q.title;
  return lookup.get(batchQuizId(batch)!) ?? "Unknown quiz";
}
