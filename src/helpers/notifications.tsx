import {
  Award,
  BadgeCheck,
  Bell,
  CalendarCheck,
  FileCheck2,
  FileX2,
  Megaphone,
  PlayCircle,
  Receipt,
  UserCheck,
} from "lucide-react";
import type { NotificationCategory } from "../api/types/notifications";

/** Human label per category, for the inbox filter and the row. */
export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  payment_confirmed: "Payment Confirmed",
  enrolled: "Enrolled",
  batch_activated: "Batch Activated",
  it_started: "IT Started",
  supervisor_assigned: "Supervisor Assigned",
  quiz_unlocked: "Quiz Unlocked",
  grade_ready: "Grade Ready",
  certificate_ready: "Certificate Ready",
  certificate_rejected: "Certificate Declined",
  batch_announcement: "Announcement",
};

export const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  ...(
    Object.keys(CATEGORY_LABELS) as NotificationCategory[]
  ).map((value) => ({ value, label: CATEGORY_LABELS[value] })),
];

export function categoryLabel(category?: NotificationCategory | null): string {
  if (!category) return "—";
  return CATEGORY_LABELS[category] ?? category;
}

/**
 * Icon per category. Falls back to the bell for pre-feature notifications,
 * which carry no category at all.
 */
export function categoryIcon(
  category?: NotificationCategory | null,
  size = 13,
) {
  switch (category) {
    case "payment_confirmed":
      return <Receipt size={size} />;
    case "enrolled":
      return <UserCheck size={size} />;
    case "batch_activated":
      return <CalendarCheck size={size} />;
    case "it_started":
      return <PlayCircle size={size} />;
    case "supervisor_assigned":
      return <UserCheck size={size} />;
    case "quiz_unlocked":
      return <BadgeCheck size={size} />;
    case "grade_ready":
      return <Award size={size} />;
    case "certificate_ready":
      return <FileCheck2 size={size} />;
    case "certificate_rejected":
      return <FileX2 size={size} />;
    case "batch_announcement":
      return <Megaphone size={size} />;
    default:
      return <Bell size={size} />;
  }
}

/** Who sent it — automatic events have no sender. */
export function senderName(
  sentBy?: { firstName?: string; lastName?: string } | string | null,
): string {
  if (!sentBy) return "System";
  if (typeof sentBy === "string") return "—";
  const name = [sentBy.firstName, sentBy.lastName].filter(Boolean).join(" ");
  return name || "—";
}
