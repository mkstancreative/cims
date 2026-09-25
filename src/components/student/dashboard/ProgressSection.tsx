import { ClipboardList } from "lucide-react";
import { ProgressRing, InfoPanel } from "../../shared/dashboard/DashboardKit";
import type { StudentDashProgress } from "../../../api/types/dashboard";

interface ProgressSectionProps {
  progress: StudentDashProgress;
  evaluation: unknown;
  startDate?: string | null;
  endDate?: string | null;
  fmt: (d: string | null) => string;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  progress,
  evaluation,
  startDate,
  endDate,
  fmt,
}) => {
  const curriculumPercent = progress.curriculum?.percent ?? 0;
  const daysRemaining = progress.daysRemaining ?? 0;

  const hasEvaluation = !!evaluation;
  const evalObj = evaluation as { status?: string; finalScore?: number | null; finalGrade?: string | null } | null;
  const evaluationStatus = evalObj?.status ?? "Pending";
  const finalScore = evalObj?.finalScore ?? "—";
  const finalGrade = evalObj?.finalGrade ?? "—";

  return (
    <div className="db-panels">
      <div className="db-ring-card">
        <div className="db-ring-card__ring">
          <ProgressRing
            pct={curriculumPercent}
            color={curriculumPercent >= 80 ? "#6366f1" : "#3b82f6"}
          />
          <div className="db-ring-card__inner">
            <span className="db-ring-card__pct">{curriculumPercent}%</span>
            <span className="db-ring-card__pct-lbl">done</span>
          </div>
        </div>
        <div className="db-ring-card__info">
          <div className="db-ring-card__title">Curriculum Progress</div>
          <div className="db-ring-card__rows">
            <div className="db-ring-card__row">
              <span className="db-ring-card__row-lbl">Start Date</span>
              <span className="db-ring-card__row-val">
                {fmt(startDate ?? null)}
              </span>
            </div>
            <div className="db-ring-card__row">
              <span className="db-ring-card__row-lbl">End Date</span>
              <span className="db-ring-card__row-val">
                {fmt(endDate ?? null)}
              </span>
            </div>
            <div className="db-ring-card__row">
              <span className="db-ring-card__row-lbl">Days Remaining</span>
              <span className="db-ring-card__row-val">{daysRemaining}</span>
            </div>
          </div>
        </div>
      </div>

      <InfoPanel
        title="Evaluation Summary"
        sub={
          hasEvaluation
            ? "Final results available"
            : "Awaiting submission"
        }
        icon={<ClipboardList size={16} />}
        iconColor="purple"
        rows={[
          {
            label: "Status",
            value: (
              <span
                style={{
                  textTransform: "capitalize",
                  color: hasEvaluation
                    ? "#6366f1"
                    : "var(--color-text-muted)",
                  fontWeight: 600,
                }}
              >
                {evaluationStatus}
              </span>
            ),
          },
          {
            label: "Final Score",
            value: (
              <span style={{ fontWeight: 600 }}>
                {finalScore}
              </span>
            ),
          },
          {
            label: "Final Grade",
            value: (
              <span style={{ fontWeight: 600 }}>
                {finalGrade}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
};
