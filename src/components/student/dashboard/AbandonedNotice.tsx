import { Archive } from "lucide-react";
import { Link } from "react-router-dom";
import "./AbandonedNotice.css";

/**
 * Shown on the student's pages when their current internship was abandoned —
 * closed because a newer one started. Muted rather than alarming: nothing went
 * wrong, their work moved to the newer placement.
 */
export function AbandonedNotice({ what }: { what?: string }) {
  return (
    <div className="abandoned-notice" role="status">
      <Archive size={16} />
      <div>
        <strong>This internship was closed when your newer one started.</strong>
        <span>
          {what ?? "It is read-only now."} See{" "}
          <Link to="/student/internships">My Internships</Link> for your current
          placement.
        </span>
      </div>
    </div>
  );
}
