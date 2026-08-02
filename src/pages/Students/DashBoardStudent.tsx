import { CheckCircle2, TrendingUp } from "lucide-react";
import { useGetMe } from "../../hooks/useAuth";
import { useStudentDashboard } from "../../hooks/useDashboard";
import { useStudentProgress } from "../../hooks/useITStudents";
import { useMyEvaluation } from "../../hooks/useEvaluations";
import { useMyCurriculum } from "../../hooks/useCurriculum";
import { useMyInternshipHistory } from "../../hooks/useInternships";
import { useCertificateStatus } from "../../hooks/useCertificate";
import {
  SectionHead,
  DashboardSkeleton,
  DashboardBanner,
} from "../../components/shared/dashboard/DashboardKit";
import "../../components/shared/dashboard/dashboard.css";
import { CertificateStatusBanner } from "../../components/student/dashboard/CertificateStatusBanner";
import {
  StudentMetricsGrid,
  type DashboardEvaluationSummary,
} from "../../components/student/dashboard/StudentMetricsGrid";
import { ProgressSection } from "../../components/student/dashboard/ProgressSection";
import { FinalDetailsSection } from "../../components/student/dashboard/FinalDetailsSection";
import { NotificationsSection } from "../../components/student/dashboard/NotificationsSection";
import type { StudentDashNotifications } from "../../api/types/dashboard";
import { fmt, ago } from "../../helpers/utilities";

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function DashBoardStudent() {
  const { data: meResp, isLoading: loadingMe } = useGetMe();
  const { data: dashResp } = useStudentDashboard();
  const { data: progressResp } = useStudentProgress();
  const { data: evalResp } = useMyEvaluation();
  const { data: curriculumResp } = useMyCurriculum();
  const { data: internshipResp } = useMyInternshipHistory();
  const { data: certResp, isLoading: loadingCert } = useCertificateStatus();

  if (loadingMe) return <DashboardSkeleton cards={6} wide />;

  const user = meResp?.data?.user;
  const profile = meResp?.data?.profile;

  // Identity for the banner (defensive — FMC shapes may vary).
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Student";
  const regNumber = profile?.registrationNumber ?? "—";
  const department = profile?.department?.name ?? "—";
  const program = profile?.program
    ? `${profile.program.type} ${profile.program.level}`.trim()
    : "—";
  const itStatus = profile?.itStatus ?? "active";

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const progress = progressResp?.data;
  const progressPercent = progress?.progressPercent ?? 0;

  const summary = evalResp?.data?.summary;
  const evaluation: DashboardEvaluationSummary = {
    hasEvaluation: summary?.hasEvaluation ?? false,
    status: summary?.status,
    finalScore: summary?.finalScore,
    finalGrade: summary?.finalGrade,
  };

  const curriculumCount = curriculumResp?.data?.curricula?.length ?? 0;

  const certificate = certResp?.data ?? null;

  // Current (or most recent) internship for the details panel.
  const internships = internshipResp?.data ?? [];
  const currentInternship =
    internships.find((i) => i.isCurrent) ?? internships[0];

  // Notifications come from the dashboard endpoint (render defensively).
  const notifications: StudentDashNotifications =
    dashResp?.data?.notifications ?? { unreadCount: 0, latest: [] };

  const itPeriodStart = profile?.itPeriod?.startDate ?? null;
  const itPeriodEnd = profile?.itPeriod?.endDate ?? null;

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
        gradient="linear-gradient(135deg, #0d9488 100%)"
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
              strokeDasharray={`${(progressPercent / 100) * 276} 276`}
            />
          </svg>
        }
      />

      <CertificateStatusBanner
        certificate={certificate}
        loadingCert={loadingCert}
      />

      <div>
        <SectionHead
          title="My Progress"
          sub="Real-time training tracking"
          icon={<TrendingUp size={16} />}
          color="teal"
        />
        <StudentMetricsGrid
          progress={progress}
          evaluation={evaluation}
          curriculumCount={curriculumCount}
          certificateStatus={certificate?.approvalStatus}
          unreadNotifications={notifications.unreadCount}
        />
      </div>

      <ProgressSection
        progress={progress}
        evaluation={evaluation}
        startDate={itPeriodStart}
        endDate={itPeriodEnd}
        fmt={fmt}
      />

      <FinalDetailsSection
        internship={currentInternship}
        certificate={certificate}
        fmt={fmt}
      />

      <NotificationsSection notifications={notifications} ago={ago} />
    </div>
  );
}
