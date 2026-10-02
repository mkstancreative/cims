import { History } from "lucide-react";
import { useSelectedInternship } from "../../../context/useInternship";
import InternshipStatusBadge from "../../ui/StatusBadge/InternshipStatusBadge";
import { internshipLabel } from "../../../helpers/internship";
import "./InternshipSwitcher.css";

/**
 * Above every student page while a past internship is selected, so it's
 * always clear whose records are on screen — and one click gets back.
 */
export default function InternshipBanner() {
  const { selected, isCurrent, current, selectCurrent } =
    useSelectedInternship();
  if (isCurrent || !selected) return null;

  return (
    <div className="isw-banner" role="status">
      <History size={16} />
      <div className="isw-banner__text">
        <strong>
          You're viewing {internshipLabel(selected)}{" "}
          <InternshipStatusBadge status={selected.itStatus} />
        </strong>
        <span>
          Everything on these pages is for this past internship, and it's
          read-only.
        </span>
      </div>
      {current && (
        <button
          type="button"
          className="isw-banner__btn"
          onClick={selectCurrent}
        >
          Back to current internship
        </button>
      )}
    </div>
  );
}
