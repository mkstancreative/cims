import { AlertTriangle } from "lucide-react";
import type { LogbookTargets as Targets } from "../../../api/types/logbook";
import "./LogbookTargets.css";

/** One "x of min" bar — met in green, short in amber. */
function TargetBar({
  label,
  value,
  min,
  met,
}: {
  label: string;
  value: number;
  min: number;
  met: boolean;
}) {
  const pct = Math.min(100, Math.round((value / min) * 100));
  return (
    <div className={`lt-bar${met ? " is-met" : ""}`}>
      <div className="lt-bar__row">
        <span>{label}</span>
        <strong>
          {value} / {min}
        </strong>
      </div>
      <div
        className="lt-bar__track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={min}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/**
 * The duration tier's logbook floor as progress bars — distinct SUBTOPICS,
 * never entries. Renders nothing when there is no requirement (`source` null,
 * or both thresholds 0): no tier is not zero progress.
 *
 * `unreachable` tiers (asking for more subtopics than the curriculum has)
 * show a configuration note instead of bars that can never fill.
 */
export default function LogbookTargets({
  targets,
  title = "Logbook minimum",
  unreachableNote,
}: {
  targets?: Targets | null;
  title?: string;
  /** Shown when the tier can't be met. Omit to render nothing in that case. */
  unreachableNote?: string;
}) {
  if (!targets?.source) return null;
  if (targets.minLogbook <= 0 && targets.minLogbookApproved <= 0) return null;

  if (!targets.reachable) {
    if (!unreachableNote) return null;
    return (
      <div className="lt lt--warn">
        <p className="lt__head">
          <AlertTriangle size={14} /> {title}
          <span> · {targets.source.label}</span>
        </p>
        <p className="lt__note">{unreachableNote}</p>
      </div>
    );
  }

  return (
    <div className="lt">
      <p className="lt__head">
        {title} <span>· {targets.source.label}</span>
      </p>
      {targets.minLogbook > 0 && (
        <TargetBar
          label="Subtopics logged"
          value={targets.submittedSubtopics}
          min={targets.minLogbook}
          met={targets.minLogbookMet}
        />
      )}
      {targets.minLogbookApproved > 0 && (
        <TargetBar
          label="Subtopics approved"
          value={targets.approvedSubtopics}
          min={targets.minLogbookApproved}
          met={targets.minLogbookApprovedMet}
        />
      )}
      <p className="lt__foot">
        Counts distinct curriculum subtopics — several entries on one subtopic
        count once.
      </p>
    </div>
  );
}
