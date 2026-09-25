import React from "react";
import {
  CalendarCheck2,
  BookOpen,
  BookMarked,
  Bell,
  CheckCircle,
  FileCheck,
} from "lucide-react";
import { KpiCard } from "../../shared/dashboard/DashboardKit";
import type { StudentDashProgress, StudentDashLogbooks } from "../../../api/types/dashboard";

interface StudentMetricsGridProps {
  progress: StudentDashProgress;
  logbooks: StudentDashLogbooks;
  unreadNotifications: number;
  evaluation: unknown;
}

export const StudentMetricsGrid: React.FC<StudentMetricsGridProps> = ({
  progress,
  logbooks,
  unreadNotifications,
}) => {
  const daysRemaining = progress.daysRemaining ?? 0;
  const curriculumPercent = progress.curriculum?.percent ?? 0;
  const totalSubtopics = progress.curriculum?.totalSubtopics ?? 0;
  const approvedSubtopics = progress.curriculum?.approvedSubtopics ?? 0;

  return (
    <div className="db-kpi-grid db-kpi-grid--wide" style={{ marginTop: 16 }}>
      <KpiCard
        label="Days Remaining"
        value={daysRemaining}
        sub="till the end of rotation"
        icon={<CalendarCheck2 size={18} />}
        color="purple"
      />
      <KpiCard
        label="Curriculum Progress"
        value={`${approvedSubtopics}/${totalSubtopics}`}
        sub="approved subtopics"
        icon={<BookMarked size={18} />}
        color="blue"
        trend={`${curriculumPercent}%`}
        trendType={curriculumPercent >= 80 ? "up" : "warn"}
        progress={curriculumPercent}
      />
      <KpiCard
        label="Draft Logbooks"
        value={logbooks.draft}
        sub="awaiting edits/submission"
        icon={<BookOpen size={18} />}
        color="purple"
        trend={logbooks.draft > 0 ? "Pending" : "None"}
        trendType={logbooks.draft > 0 ? "warn" : "neutral"}
      />
      <KpiCard
        label="Submitted Logbooks"
        value={logbooks.submitted}
        sub="pending supervisor review"
        icon={<FileCheck size={18} />}
        color="amber"
        trend={logbooks.submitted > 0 ? "Awaiting" : "None"}
        trendType={logbooks.submitted > 0 ? "warn" : "neutral"}
      />
      <KpiCard
        label="Approved Logbooks"
        value={logbooks.approved}
        sub="successfully verified"
        icon={<CheckCircle size={18} />}
        color="violet"
        trend={logbooks.approved > 0 ? "Completed" : "None"}
        trendType={logbooks.approved > 0 ? "up" : "neutral"}
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
