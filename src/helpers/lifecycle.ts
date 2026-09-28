import type { LifecycleResource } from "../api/types/lifecycle";

interface ResourceConfig {
  /** API base; the id is appended. */
  base: string;
  /** React Query key prefix to refresh after a change. */
  queryKey: string;
  /** "quiz", "curriculum", … — used in titles and messages. */
  noun: string;
  /** What deactivating does to people downstream — shown before confirming. */
  deactivateEffect: string;
  /** What reactivating brings back. */
  activateEffect: string;
}

/**
 * Same mechanics, different consequences — this copy is what the admin reads
 * before confirming, so it states each resource's real downstream effect.
 */
export const LIFECYCLE: Record<LifecycleResource, ResourceConfig> = {
  quiz: {
    base: "/quizzes",
    queryKey: "quizzes",
    noun: "quiz",
    deactivateEffect:
      "Students on batches holding this quiz will immediately lose access to it. Their attempts and scores are kept, and reactivating restores everything.",
    activateEffect:
      "Students on batches holding this quiz will be able to take it again.",
  },
  curriculum: {
    base: "/curriculum",
    queryKey: "curricula",
    noun: "curriculum",
    deactivateEffect:
      "Existing students keep seeing it and keep their progress. It just can't be linked to new batches.",
    activateEffect: "It can be linked to new batches again.",
  },
  institution: {
    base: "/admin/institutions",
    queryKey: "institutions",
    noun: "institution",
    deactivateEffect:
      "It disappears from the list new students register against. Existing students keep their records and their link to it.",
    activateEffect: "New students will be able to register against it again.",
  },
  duration: {
    base: "/admin/durations",
    queryKey: "durations",
    noun: "duration",
    deactivateEffect:
      "Students can no longer choose it at registration. Prices already paid are untouched. This is refused while the tier still has live batches or open registrations.",
    activateEffect:
      "Students will be able to choose it again. You'll be warned if its week range overlaps another active duration.",
  },
};

/** The fields the lifecycle dialogs need from any of the four resources. */
export interface LifecycleTarget {
  _id: string;
  /** Display name — title, name or duration label. */
  name: string;
  isActive: boolean;
}
