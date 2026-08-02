import "./StatusBadge.css";

type StatusKey =
  | "active"
  | "inactive"
  | "created"
  | "archived"
  | "withdrawn"
  | "enabled"
  | "disabled"
  | "present"
  | "absent"
  | "success"
  | "pending"
  | "seeking_placement"
  | "placed"
  | "completed"
  | "failed"
  | "enrolled"
  | "rejected"
  | "uploaded"
  | "open"
  | "closed"
  | "ended"
  | "passed"
  | "in-progress"
  | "students_uploaded"
  | "in_progress"
  | "completed"
  | "verified"
  | "pending_verification"
  | "read"
  | "unread"
  | "successful"
  | "approved"

const statusMap: Record<StatusKey, StatusKey> = {
  // Student / applicant
  active: "active",
  inactive: "inactive",
  created: "created",
  archived: "archived",
  withdrawn: "withdrawn",

  // Admins / Lecturers
  enabled: "enabled",
  disabled: "disabled",

  // Attendance
  present: "present",
  absent: "absent",

  // Fees / payments
  success: "success",
  pending: "pending",
  seeking_placement: "seeking_placement",
  pending_verification: "pending_verification",
  placed: "placed",
  failed: "failed",

  // Enrollment
  enrolled: "enrolled",
  rejected: "rejected",

  uploaded: "uploaded",

  open: "open",
  closed: "closed",
  ended: "ended",
  read: "read",
  unread: "unread",

  // Academic
  passed: "passed",
  "in-progress": "in-progress",
  students_uploaded: "students_uploaded",
  in_progress: "in_progress",
  completed: "completed",
  verified: "verified",
  approved: "approved",

  // Certificate
  successful: "successful",
};

interface StatusBadgeProps {
  status?: string;
  category?: string;
  type?: string;
}

function StatusBadge({ status, category, type }: StatusBadgeProps) {
  const value = status || category || type;

  const getStatusClass = (statusText?: string): string => {
    if (!statusText) return "status-badge";

    const text = statusText.toLowerCase() as StatusKey;

    return statusMap[text] || "status-badge";
  };

  return (
    <span className={`status-badge ${getStatusClass(value)}`}>
      <span>{String(value).replace(/_/g, " ")}</span>
    </span>
  );
}

export default StatusBadge;
