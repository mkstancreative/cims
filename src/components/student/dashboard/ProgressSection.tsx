import { ClipboardList } from "lucide-react";
import { ProgressRing, InfoPanel } from "../../shared/dashboard/DashboardKit";
import type { StudentProgress } from "../../../api/types/itstudent";
import type { DashboardEvaluationSummary } from "./StudentMetricsGrid";

interface ProgressSectionProps {
  progress?: StudentProgress;
  evaluation?: DashboardEvaluationSummary;
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
  const progressPercent = progress?.progressPercent ?? 0;
  const totalWeeks = progress?.totalWeeks ?? 0;
  const weeksCompleted = progress?.weeksCompleted ?? 0;
  const daysRemaining = progress?.daysRemaining ?? 0;

  return (
    <div className="db-panels">
      <div className="db-ring-card">
        <div className="db-ring-card__ring">
          <ProgressRing
            pct={progressPercent}
            color={progressPercent >= 80 ? "#10b981" : "#f59e0b"}
          />
          <div className="db-ring-card__inner">
            <span className="db-ring-card__pct">{progressPercent}%</span>
            <span className="db-ring-card__pct-lbl">done</span>
          </div>
        </div>
        <div className="db-ring-card__info">
          <div className="db-ring-card__title">IT Duration Progress</div>
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
              <span className="db-ring-card__row-lbl">Weeks Left</span>
              <span className="db-ring-card__row-val">
                {Math.max(totalWeeks - weeksCompleted, 0)}
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
          evaluation?.hasEvaluation
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
                  color: evaluation?.hasEvaluation
                    ? "#10b981"
                    : "var(--color-text-muted)",
                  fontWeight: 600,
                }}
              >
                {evaluation?.status ?? "Pending"}
              </span>
            ),
          },
          {
            label: "Final Score",
            value: (
              <span style={{ fontWeight: 600 }}>
                {evaluation?.finalScore ?? "—"}
              </span>
            ),
          },
          {
            label: "Final Grade",
            value: (
              <span style={{ fontWeight: 600 }}>
                {evaluation?.finalGrade ?? "—"}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
};
