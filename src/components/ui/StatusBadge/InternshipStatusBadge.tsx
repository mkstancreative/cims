import StatusBadge from "./StatusBadge";
import { ABANDONED_HINT, isAbandoned } from "../../../helpers/internship";

/**
 * An internship's IT status. `abandoned` renders grey with a tooltip — it's
 * not a failure, the student's work moved to a newer internship.
 */
export default function InternshipStatusBadge({
  status,
}: {
  status?: string | null;
}) {
  if (!status) return <>—</>;
  if (!isAbandoned(status)) return <StatusBadge status={status} />;
  return (
    <span className="status-badge-tip">
      <StatusBadge status={status} title={ABANDONED_HINT} />
      <span className="sr-only">{ABANDONED_HINT}</span>
    </span>
  );
}
