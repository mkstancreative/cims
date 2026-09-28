import StatusBadge from "./StatusBadge";
import { ABANDONED_HINT, isAbandoned } from "../../../helpers/internship";

/**
 * An internship's IT status. `abandoned` renders muted with a tooltip — it's
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
    <span className="status-badge-tip" title={ABANDONED_HINT}>
      <StatusBadge status={status} />
      <span className="sr-only">{ABANDONED_HINT}</span>
    </span>
  );
}
