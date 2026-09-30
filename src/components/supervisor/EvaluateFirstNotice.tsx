import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import "./EvaluateFirstNotice.css";

const noticeKey = (userId: string) => `notice:evaluate-first:${userId}`;

function readDismissed(userId: string): boolean {
  try {
    return localStorage.getItem(noticeKey(userId)) === "dismissed";
  } catch {
    return false;
  }
}

/**
 * The order of the supervisor's work changed: the evaluation now OPENS the
 * quiz, instead of following it. Supervisors who wait for a quiz score before
 * evaluating wait forever — so this says so, where they'd act on it. Shown
 * until dismissed (remembered per account).
 */
export function EvaluateFirstNotice({ showLink = false }: { showLink?: boolean }) {
  const { user } = useAuth();
  const userId = user?.id ?? "anon";
  const [dismissed, setDismissed] = useState(() => readDismissed(userId));

  if (dismissed) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(noticeKey(userId), "dismissed");
    } catch {
      // Storage blocked — it just shows again next visit.
    }
    setDismissed(true);
  };

  return (
    <section className="efn" aria-labelledby="efn-title">
      <span className="efn__icon" aria-hidden="true">
        <ClipboardCheck size={18} />
      </span>
      <div className="efn__body">
        <h3 id="efn-title" className="efn__title">
          Evaluate first — then the student&apos;s quiz opens
        </h3>
        <p className="efn__lead">
          A student&apos;s quiz won&apos;t open until you&apos;ve submitted
          their evaluation <em>and</em> they&apos;re marked present at their
          sitting. If you&apos;re waiting for a quiz score before evaluating,
          the quiz can&apos;t happen — please evaluate before the sitting.
        </p>
        <ul className="efn__list">
          <li>
            Their curriculum no longer has to be 100% complete. If it
            isn&apos;t, you&apos;ll be asked to confirm — that closes their
            logbook, but their quiz and final grade are unaffected.
          </li>
          <li>
            Once you submit, the evaluation shows as{" "}
            <strong>Awaiting quiz</strong> until the final grade is calculated.
          </li>
          <li>
            When you unlock a sitting, you&apos;ll see which present students
            still need an evaluation.
          </li>
        </ul>
        <div className="efn__actions">
          {showLink && (
            <Link to="/supervisor/students-evaluations" className="efn__cta">
              Go to evaluations <ArrowRight size={14} />
            </Link>
          )}
          <button type="button" className="efn__dismiss" onClick={dismiss}>
            Got it
          </button>
        </div>
      </div>
    </section>
  );
}
