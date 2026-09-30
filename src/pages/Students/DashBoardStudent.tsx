import { CheckCircle2, TrendingUp } from "lucide-react";
import { useStudentDashboard } from "../../hooks/useDashboard";
import {
  SectionHead,
  DashboardSkeleton,
  DashboardBanner,
  DashboardError,
} from "../../components/shared/dashboard/DashboardKit";
import "../../components/shared/dashboard/dashboard.css";
import "./DashBoardStudent.css";
import { StudentMetricsGrid } from "../../components/student/dashboard/StudentMetricsGrid";
import { QuizAttendanceChip } from "../../components/student/dashboard/QuizAttendanceChip";
import { ProgressSection } from "../../components/student/dashboard/ProgressSection";
import { FinalDetailsSection } from "../../components/student/dashboard/FinalDetailsSection";
import { NotificationsSection } from "../../components/student/dashboard/NotificationsSection";
import { PaymentRequiredPanel } from "../../components/student/dashboard/PaymentRequiredPanel";
import { EnrolmentPendingPanel } from "../../components/student/dashboard/EnrolmentPendingPanel";
import { AbandonedNotice } from "../../components/student/dashboard/AbandonedNotice";
import LogbookTargets from "../../components/shared/LogbookTargets/LogbookTargets";
import { QuizSummaryCard } from "../../components/student/dashboard/QuizSummaryCard";
import { fmt, ago } from "../../helpers/utilities";
import {
  apiErrorMessage,
  isNoInternshipError,
  isPaymentRequiredError,
} from "../../helpers/registration";

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function DashBoardStudent() {
  const { data: dashResp, isLoading, error } = useStudentDashboard();

  if (isLoading) return <DashboardSkeleton cards={6} wide />;

  // Unpaid registration fee: the API refuses dashboard data, so offer payment.
  if (isPaymentRequiredError(error))
    return (
      <PaymentRequiredPanel message={apiErrorMessage(error, "")} />
    );

  // Paid but not placed in a batch yet — show where their registration stands.
  if (isNoInternshipError(error)) return <EnrolmentPendingPanel />;

  if (!dashResp?.data)
    return (
      <DashboardError
        message={
          error
            ? apiErrorMessage(error, "Unable to load dashboard.")
            : ((dashResp as { message?: string } | undefined)?.message ??
              "Unable to load dashboard.")
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

      {/* `isCurrent` isn't "live" — a current internship can be abandoned. */}
      {itStatus === "abandoned" ? (
        <AbandonedNotice what="Its logbooks, quiz and evaluation are closed." />
      ) : (
        <QuizAttendanceChip />
      )}

      {/* ── KPIs — one compact row on wide screens ── */}
      <div className="sd-kpis">
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

      {/* ── Main column + sidebar; stacks on narrow screens ── */}
      <div className="sd-layout">
        <div className="sd-main">
          {/* The quiz at a glance — whose move it is, and both grade halves.
              An abandoned internship's quiz is closed; the notice says so. */}
          {itStatus !== "abandoned" && <QuizSummaryCard />}

          <ProgressSection
            progress={progress}
            evaluation={evaluation}
            startDate={progress.startDate}
            endDate={progress.endDate}
            fmt={fmt}
          />

          <NotificationsSection notifications={notifications} ago={ago} />
        </div>

        <aside className="sd-side">
          <FinalDetailsSection
            batch={batch}
            itStatus={itStatus}
            supervisor={supervisor}
            fmt={fmt}
          />

          {/* The tier's minimum counts SUBTOPICS — the KPI cards count
              entries. Nothing renders when the batch has no requirement. */}
          <LogbookTargets
            targets={progress.logbookTargets}
            title="Logbook requirement"
            unreachableNote="Your batch asks for more logbook subtopics than its curriculum has, so it can't be met yet. Please let your coordinator know."
          />
        </aside>
      </div>
    </div>
  );
}
