import type { LogBookActivity } from "../api/types/logbook";

/** Pulls the id out of a ref that may be expanded or already a plain id. */
export function refId(ref: string | { _id: string } | undefined): string {
  if (!ref) return "";
  return typeof ref === "string" ? ref : ref._id;
}

export function curriculumName(act: LogBookActivity): string {
  const ref = act.curriculum;
  return ref && typeof ref === "object" ? ref.name : "—";
}

export function topicTitle(act: LogBookActivity): string {
  const ref = act.topic;
  return ref && typeof ref === "object" ? ref.title : "—";
}

export function subtopicTitle(act: LogBookActivity): string {
  const ref = act.subtopic;
  return ref && typeof ref === "object" ? ref.title : "—";
}

/**
 * "Topic › Subtopic" — the headline for an entry, replacing the old free-text
 * activity name. Falls back to whichever half resolved when refs are unexpanded.
 */
export function activityLabel(act: LogBookActivity): string {
  const topic = topicTitle(act);
  const subtopic = subtopicTitle(act);
  if (topic !== "—" && subtopic !== "—") return `${topic} › ${subtopic}`;
  if (subtopic !== "—") return subtopic;
  if (topic !== "—") return topic;
  return "Untitled entry";
}

/** Derived from the date so the payload doesn't need to carry `dayOfWeek`. */
export function dayOfWeek(date?: string): string {
  if (!date) return "Day";
  const [y, m, d] = date.slice(0, 10).split("-");
  const parsed = new Date(Number(y), Number(m) - 1, Number(d));
  return isNaN(parsed.getTime())
    ? "Day"
    : parsed.toLocaleDateString("en-US", { weekday: "long" });
}
