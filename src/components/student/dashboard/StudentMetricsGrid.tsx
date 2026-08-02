import React from "react";
import {
  CalendarCheck2,
  BookOpen,
  GraduationCap,
  BookMarked,
  Award,
  Bell,
} from "lucide-react";
import { KpiCard } from "../../shared/dashboard/DashboardKit";
import type { StudentProgress } from "../../../api/types/itstudent";

export interface DashboardEvaluationSummary {
  hasEvaluation: boolean;
  status?: string;
  finalScore?: number;
  finalGrade?: string;
}

interface StudentMetricsGridProps {
  progress?: StudentProgress;
  evaluation?: DashboardEvaluationSummary;
  curriculumCount: number;
  certificateStatus?: string;
  unreadNotifications: number;
}

export const StudentMetricsGrid: React.FC<StudentMetricsGridProps> = ({
  progress,
  evaluation,
  curriculumCount,
  certificateStatus,
  unreadNotifications,
}) => {
  const weeksCompleted = progress?.weeksCompleted ?? 0;
  const totalWeeks = progress?.totalWeeks ?? 0;
  const daysRemaining = progress?.daysRemaining ?? 0;
  const progressPercent = progress?.progressPercent ?? 0;
  const logbooksApproved = progress?.logbooksApproved ?? 0;
  const logbooksSubmitted = progress?.logbooksSubmitted ?? 0;
  const minimumRequired = progress?.minimumRequired ?? 0;
  const meetsRequirement = progress?.meetsRequirement ?? false;

  const certLabel = certificateStatus
    ? certificateStatus.charAt(0).toUpperCase() + certificateStatus.slice(1)
    : "Not Requested";

  return (
    <div className="db-kpi-grid db-kpi-grid--wide" style={{ marginTop: 16 }}>
      <KpiCard
        label="Weeks Completed"
        value={`${weeksCompleted}/${totalWeeks}`}
        sub={`${daysRemaining} days remaining`}
        icon={<CalendarCheck2 size={18} />}
        color="teal"
        trend={`${progressPercent}%`}
        trendType={progressPercent >= 80 ? "up" : "warn"}
        progress={progressPercent}
      />
      <KpiCard
        label="Logbooks Approved"
        value={logbooksApproved}
        sub={`of ${logbooksSubmitted} submitted`}
        icon={<BookOpen size={18} />}
        color="purple"
        trend={meetsRequirement ? "✓ Met" : `Need ${minimumRequired}`}
        trendType={meetsRequirement ? "up" : "warn"}
        progress={Math.round(
          (logbooksApproved / Math.max(minimumRequired, 1)) * 100,
        )}
      />
      <KpiCard
        label="Curriculum"
        value={curriculumCount}
        sub={curriculumCount === 1 ? "assigned curriculum" : "assigned curricula"}
        icon={<BookMarked size={18} />}
        color="blue"
        trend={curriculumCount > 0 ? "Available" : "None"}
        trendType={curriculumCount > 0 ? "up" : "neutral"}
      />
      <KpiCard
        label="Final Score"
        value={evaluation?.finalScore ?? "Pending"}
        sub={
          evaluation?.hasEvaluation
            ? "Evaluation complete"
            : "Awaiting evaluation"
        }
        icon={<GraduationCap size={18} />}
        color="green"
        trend={evaluation?.finalGrade ?? "—"}
        trendType={
          !evaluation?.finalGrade
            ? "neutral"
            : evaluation.finalGrade === "A" || evaluation.finalGrade === "B"
              ? "up"
              : "warn"
        }
      />
      <KpiCard
        label="Certificate"
        value={certLabel}
        sub="Completion certificate"
        icon={<Award size={18} />}
        color={certificateStatus === "approved" ? "green" : "slate"}
        trend={certificateStatus === "approved" ? "Ready" : "Pending"}
        trendType={certificateStatus === "approved" ? "up" : "neutral"}
      />
      <KpiCard
        label="Notifications"
        value={unreadNotifications}
        sub="Unread messages"
        icon={<Bell size={18} />}
        color={unreadNotifications > 0 ? "rose" : "slate"}
        trend={unreadNotifications > 0 ? "New" : "All read"}
        trendType={unreadNotifications > 0 ? "warn" : "up"}
      />
    </div>
  );
};
