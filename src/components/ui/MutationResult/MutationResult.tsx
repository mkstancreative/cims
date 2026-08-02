import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { UpdateStatusApiResult } from "../../../api/types/student";
import "./MutationResult.css";

interface MutationResultProps {
  result: UpdateStatusApiResult;
  onClose: () => void;
}

export default function MutationResult({
  result,
  onClose,
}: MutationResultProps) {
  const { successful, failed, total, errors } = result.data;
  const allOk = failed === 0;
  const allFail = successful === 0;

  const variant = allOk ? "success" : allFail ? "error" : "warning";

  const icon = allOk ? (
    <CheckCircle size={32} />
  ) : allFail ? (
    <XCircle size={32} />
  ) : (
    <AlertTriangle size={32} />
  );

  const headline = allOk
    ? `All ${total} student${total !== 1 ? "s" : ""} updated successfully`
    : allFail
      ? `Update failed for all ${total} student${total !== 1 ? "s" : ""}`
      : `${successful} updated · ${failed} failed`;

  return (
    <div className="mr-container">
      {/* ── Banner ── */}
      <div className={`mr-banner mr-banner--${variant}`}>
        <span className={`mr-banner-icon mr-banner-icon--${variant}`}>
          {icon}
        </span>
        <div className="mr-banner-body">
          <p className="mr-banner-headline">{headline}</p>
          <p className="mr-banner-msg">{result.message}</p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="mr-stats">
        <div className="mr-stat mr-stat--total">
          <span className="mr-stat-val">{total}</span>
          <span className="mr-stat-lbl">Total</span>
        </div>
        <div className="mr-stat mr-stat--ok">
          <span className="mr-stat-val">{successful}</span>
          <span className="mr-stat-lbl">Updated</span>
        </div>
        <div className="mr-stat mr-stat--fail">
          <span className="mr-stat-val">{failed}</span>
          <span className="mr-stat-lbl">Failed</span>
        </div>
      </div>

      {/* ── Error list ── */}
      {errors && errors.length > 0 && (
        <div className="mr-errors">
          <p className="mr-errors-title">
            <XCircle size={13} /> Errors
          </p>
          <ul className="mr-error-list">
            {errors.map((e) => (
              <li key={e.studentId} className="mr-error-item">
                <div className="mr-error-reg">{e.registrationNumber}</div>
                <div className="mr-error-msg">{e.error}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Done button ── */}
      <button className="mr-done" onClick={onClose}>
        {allOk ? "Done" : "Close"}
      </button>
    </div>
  );
}
