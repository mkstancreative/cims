import {
  BookOpen,
  CheckCircle2,
  Layers,
  TrendingUp,
  Users,
  UserCheck,
  Building2,
} from "lucide-react";
import { useAdminDashboard } from "../../hooks/useDashboard";
import {
  InfoPanel,
  KpiCard,
  ProgressRing,
  SectionHead,
  DashboardSkeleton,
  DashboardBanner,
  DashboardError,
} from "../../components/shared/dashboard/DashboardKit";
import "../../components/shared/dashboard/dashboard.css";
import { useAuth } from "../../context/useAuth";

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function DashBoardAdmin() {
  const { user } = useAuth();
  const { data: resp, isLoading } = useAdminDashboard();

  if (isLoading) return <DashboardSkeleton cards={7} wide />;
  if (!resp?.data) return <DashboardError />;

  const students = resp.data?.students ?? {
    total: 0,
    totalInternships: 0,
    placed: 0,
    active: 0,
    completed: 0,
  };
  const supervisors = resp.data?.supervisors ?? { total: 0 };
  const logbooks = resp.data?.logbooks ?? {
    pending: 0,
    approved: 0,
    rejected: 0,
  };
  const batches = resp.data?.batches ?? { total: 0, active: 0 };

  const firstName = user?.firstName ?? "Admin";
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  const placementRate =
    students.totalInternships > 0
      ? Math.round(
          ((students.placed + students.active + students.completed) /
            students.totalInternships) *
            100,
        )
      : 0;

  const logbookApprovalRate =
    logbooks.approved + logbooks.pending + logbooks.rejected > 0
      ? Math.round(
          (logbooks.approved /
            (logbooks.approved + logbooks.pending + logbooks.rejected)) *
            100,
        )
      : 0;

  const appName = import.meta.env.VITE_APP_NAME;

  return (
    <div className="db-page">
      <DashboardBanner
        greeting="Administration Overview 🏛️"
        name={`Welcome, ${firstName}!`}
        meta={`${appName} · Admin Dashboard`}
        badge={
          <>
            <CheckCircle2 size={12} /> {students.completed} Student
            {students.completed !== 1 ? "s" : ""} Completed
          </>
        }
        initials={initials}
        gradient="var(--color-purple)"
      />

      {/* ── Students KPIs ──────────────────────────────────────────────────── */}
      <div>
        <SectionHead
          title="Student Overview"
          sub={`${students.total} total students · ${students.totalInternships} internships`}
          icon={<Users size={16} />}
          color="purple"
        />
        <div
          className="db-kpi-grid db-kpi-grid--wide"
          style={{ marginTop: 16 }}
        >
          <KpiCard
            label="Total Students"
            value={students.total}
            sub="All enrolments"
            icon={<Users size={18} />}
            color="purple"
          />
          <KpiCard
            label="Internships"
            value={students.totalInternships}
            sub="Students with internship"
            icon={<Building2 size={18} />}
            color="blue"
          />
          <KpiCard
            label="Placed"
            value={students.placed}
            sub="Currently placed"
            icon={<Building2 size={18} />}
            color="blue"
          />
          <KpiCard
            label="Active IT"
            value={students.active}
            sub="Currently interning"
            icon={<TrendingUp size={18} />}
            color="purple"
            trend={students.active > 0 ? "Active" : "None"}
            trendType={students.active > 0 ? "up" : "neutral"}
          />
          <KpiCard
            label="Completed"
            value={students.completed}
            sub="IT fully completed"
            icon={<CheckCircle2 size={18} />}
            color="violet"
            trend={`${placementRate}% placement rate`}
            trendType={placementRate >= 60 ? "up" : "warn"}
          />
          <KpiCard
            label="Placement Rate"
            value={`${placementRate}%`}
            sub="Placed + Active + Completed"
            icon={<TrendingUp size={18} />}
            color={
              placementRate >= 70
                ? "violet"
                : placementRate >= 40
                  ? "amber"
                  : "rose"
            }
            progress={placementRate}
          />
                 <div className="db-ring-card">
          <div className="db-ring-card__ring">
            <ProgressRing
              pct={logbookApprovalRate}
              color={logbookApprovalRate >= 80 ? "#6366f1" : "#f59e0b"}
            />
            <div className="db-ring-card__inner">
              <span className="db-ring-card__pct">{logbookApprovalRate}%</span>
              <span className="db-ring-card__pct-lbl">approved</span>
            </div>
          </div>
          <div className="db-ring-card__info">
            <div className="db-ring-card__title">Logbook Activity</div>
            <div className="db-ring-card__rows">
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Approved</span>
                <span
                  className="db-ring-card__row-val"
                  style={{ color: "#6366f1" }}
                >
                  {logbooks.approved}
                </span>
              </div>
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Pending Review</span>
                <span
                  className="db-ring-card__row-val"
                  style={{
                    color:
                      logbooks.pending > 0
                        ? "#f59e0b"
                        : "var(--color-text-muted)",
                  }}
                >
                  {logbooks.pending}
                </span>
              </div>
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Rejected</span>
                <span
                  className="db-ring-card__row-val"
                  style={{
                    color:
                      logbooks.rejected > 0
                        ? "#f43f5e"
                        : "var(--color-text-muted)",
                  }}
                >
                  {logbooks.rejected}
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* ── Logbook Ring ────────────────────────────────────────────────────── */}
      {/* <div className="db-panels">
 
      </div> */}

      {/* ── Supervisors, Batches & Logbook Info ─────────────────────────────── */}
      <div className="db-panels">
        <InfoPanel
          title="Supervisor Summary"
          sub="Registered supervisors"
          icon={<UserCheck size={16} />}
          iconColor="purple"
          rows={[{ label: "Total Supervisors", value: supervisors.total }]}
        />
        <InfoPanel
          title="Batch Overview"
          sub="Placement cohort management"
          icon={<Layers size={16} />}
          iconColor="amber"
          rows={[
            { label: "Total Batches", value: batches.total },
            {
              label: "Active Batches",
              value: (
                <span
                  style={{
                    color:
                      batches.active > 0
                        ? "#6366f1"
                        : "var(--color-text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {batches.active}
                </span>
              ),
            },
            {
              label: "Inactive",
              value: batches.total - batches.active,
            },
          ]}
        />
        <InfoPanel
          title="Logbook Summary"
          sub="Approval pipeline"
          icon={<BookOpen size={16} />}
          iconColor="violet"
          rows={[
            {
              label: "Pending Review",
              value: (
                <span
                  style={{
                    color:
                      logbooks.pending > 0
                        ? "#f59e0b"
                        : "var(--color-text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {logbooks.pending}
                </span>
              ),
            },
            {
              label: "Approved",
              value: (
                <span style={{ color: "#6366f1", fontWeight: 600 }}>
                  {logbooks.approved}
                </span>
              ),
            },
            {
              label: "Rejected",
              value: (
                <span
                  style={{
                    color:
                      logbooks.rejected > 0
                        ? "#f43f5e"
                        : "var(--color-text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {logbooks.rejected}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
