import { CheckCircle2, TrendingUp } from "lucide-react";
import { useStudentDashboard } from "../../hooks/useDashboard";
import {
  SectionHead,
  DashboardSkeleton,
  DashboardBanner,
  DashboardError,
} from "../../components/shared/dashboard/DashboardKit";
import "../../components/shared/dashboard/dashboard.css";
import { StudentMetricsGrid } from "../../components/student/dashboard/StudentMetricsGrid";
import { QuizAttendanceChip } from "../../components/student/dashboard/QuizAttendanceChip";
import { ProgressSection } from "../../components/student/dashboard/ProgressSection";
import { FinalDetailsSection } from "../../components/student/dashboard/FinalDetailsSection";
import { NotificationsSection } from "../../components/student/dashboard/NotificationsSection";
import { fmt, ago } from "../../helpers/utilities";

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function DashBoardStudent() {
  const { data: dashResp, isLoading } = useStudentDashboard();

  if (isLoading) return <DashboardSkeleton cards={6} wide />;
  if (!dashResp?.data)
    return (
      <DashboardError
        message={
          (dashResp as { message?: string } | undefined)?.message ??
          "Unable to load dashboard."
        }
      />
    );

  const data = dashResp.data;
  const student = data.student;
  const progress = data.progress;
  const logbooks = data.logbooks;
  const supervisor = data.supervisor;
  const batch = data.batch;
  const notifications = data.notifications;
  const evaluation = data.evaluation;

  // Identity info from dashboard response
  const fullName = student.name || "Student";
  const regNumber = student.registrationNumber || "—";
  const department = student.department || "—";
  const program = student.program || "—";
  const itStatus = student.itStatus || "active";

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const curriculumPercent = progress.curriculum?.percent ?? 0;

  return (
    <div className="db-page">
      <DashboardBanner
        greeting="Welcome back 👋"
        name={fullName}
        meta={`${regNumber} · ${department} · ${program}`}
        badge={
          <>
            <CheckCircle2 size={12} /> {itStatus.replace(/_/g, " ")}
          </>
        }
        initials={initials}
        gradient="var(--color-primary)"
        avatarOverlay={
          <svg
            style={{
              position: "absolute",
              inset: -4,
              transform: "rotate(-90deg)",
            }}
            width={98}
            height={98}
            viewBox="0 0 98 98"
          >
            <circle
              cx={49}
              cy={49}
              r={44}
              fill="none"
              stroke="rgba(255,255,255,.2)"
              strokeWidth={5}
            />
            <circle
              cx={49}
              cy={49}
              r={44}
              fill="none"
              stroke="rgba(255,255,255,.7)"
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={`${(curriculumPercent / 100) * 276} 276`}
            />
          </svg>
        }
      />

      <QuizAttendanceChip />

      <div>
        <SectionHead
          title="My Progress"
          sub="Real-time training tracking"
          icon={<TrendingUp size={16} />}
          color="primary"
        />
        <StudentMetricsGrid
          progress={progress}
          logbooks={logbooks}
          unreadNotifications={notifications.unreadCount}
          evaluation={evaluation}
        />
      </div>

      <ProgressSection
        progress={progress}
        evaluation={evaluation}
        startDate={progress.startDate}
        endDate={progress.endDate}
        fmt={fmt}
      />

      <FinalDetailsSection
        batch={batch}
        itStatus={itStatus}
        supervisor={supervisor}
        fmt={fmt}
      />

      <NotificationsSection notifications={notifications} ago={ago} />
    </div>
  );
}
