import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Users,
  UserCheck,
  AlertCircle,
  ClipboardList,
  Bell,
} from "lucide-react";
import { useSupervisorDashboard } from "../../hooks/useDashboard";
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
export default function DashBoardSupervisor() {
  const { user } = useAuth();
  const { data: resp, isLoading } = useSupervisorDashboard();

  if (isLoading) return <DashboardSkeleton cards={6} wide />;
  if (!resp?.data) return <DashboardError />;

  // ── Extract defensively from nested API shape (FMC shape may differ) ─────────
  const d = resp.data;
  const sup = d?.supervisor;
  const stu = d?.students;
  const logs = d?.logbooks;
  const notifs = d?.notifications;

  const totalStudents = stu?.totalAssigned ?? 0;
  const activeStudents = (stu?.placed ?? 0) + (stu?.active ?? 0);
  const completedStudents = stu?.completed ?? 0;
  const needingEval = stu?.needingEvaluation ?? 0;
  const pendingLogbooks = logs?.pendingReview ?? 0;
  const unreadNotifs = notifs?.unreadCount ?? 0;

  const activeRate =
    totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

  const capacityPct = sup?.capacityPercent ?? 0;

  const firstName = user?.firstName ?? "Supervisor";
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="db-page">
      <DashboardBanner
        greeting="School Supervisor Portal"
        name={`Hello, ${firstName}!`}
        meta={`${sup?.department ?? ""} · ${sup?.specialization ?? ""}`}
        badge={
          <>
            <Users size={12} /> {totalStudents} student
            {totalStudents !== 1 ? "s" : ""} assigned
          </>
        }
        initials={initials}
        gradient="linear-gradient(135deg, #0d9488 100%)"
      />

      {/* ── Student KPIs ───────────────────────────────────────────────────── */}
      <div>
        <SectionHead
          title="Student Overview"
          sub={`${totalStudents} students across all statuses`}
          icon={<Users size={16} />}
          color="purple"
        />
        <div
          className="db-kpi-grid db-kpi-grid--wide"
          style={{ marginTop: 16 }}
        >
          <KpiCard
            label="Total Assigned"
            value={totalStudents}
            sub="Under supervision"
            icon={<Users size={18} />}
            color="teal"
          />
          <KpiCard
            label="Active / Placed"
            value={activeStudents}
            sub="Currently interning"
            icon={<TrendingUp size={18} />}
            color="purple"
            trend={`${activeRate}%`}
            trendType={activeRate >= 50 ? "up" : "warn"}
            progress={activeRate}
          />
          <KpiCard
            label="Completed"
            value={completedStudents}
            sub="IT fully finished"
            icon={<CheckCircle2 size={18} />}
            color="green"
            trend={completedStudents > 0 ? "✓" : "—"}
            trendType={completedStudents > 0 ? "up" : "neutral"}
          />
          <KpiCard
            label="Needing Evaluation"
            value={needingEval}
            sub="Evaluation pending"
            icon={<AlertCircle size={18} />}
            color={needingEval > 0 ? "amber" : "slate"}
            trend={needingEval > 0 ? "Action needed" : "All clear"}
            trendType={needingEval > 0 ? "warn" : "up"}
          />
          <KpiCard
            label="Logbooks Pending"
            value={pendingLogbooks}
            sub="Awaiting your review"
            icon={<BookOpen size={18} />}
            color={pendingLogbooks > 0 ? "rose" : "slate"}
            trend={pendingLogbooks > 0 ? "Review now" : "All reviewed"}
            trendType={pendingLogbooks > 0 ? "danger" : "up"}
          />
          <KpiCard
            label="Notifications"
            value={unreadNotifs}
            sub="Unread alerts"
            icon={<Bell size={18} />}
            color={unreadNotifs > 0 ? "amber" : "slate"}
            trend={unreadNotifs > 0 ? "New" : "All read"}
            trendType={unreadNotifs > 0 ? "warn" : "up"}
          />
        </div>
      </div>

      {/* ── Rings ───────────────────────────────────────────────────────────── */}
      <div className="db-panels">
        {/* Active rate ring */}
        <div className="db-ring-card">
          <div className="db-ring-card__ring">
            <ProgressRing
              pct={activeRate}
              color={activeRate >= 70 ? "#10b981" : "#f59e0b"}
            />
            <div className="db-ring-card__inner">
              <span className="db-ring-card__pct">{activeRate}%</span>
              <span className="db-ring-card__pct-lbl">active</span>
            </div>
          </div>
          <div className="db-ring-card__info">
            <div className="db-ring-card__title">Student Activity Rate</div>
            <div className="db-ring-card__rows">
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Total Assigned</span>
                <span className="db-ring-card__row-val">{totalStudents}</span>
              </div>
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Placed</span>
                <span
                  className="db-ring-card__row-val"
                  style={{ color: "#6366f1" }}
                >
                  {stu?.placed ?? 0}
                </span>
              </div>
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Active</span>
                <span
                  className="db-ring-card__row-val"
                  style={{ color: "#10b981" }}
                >
                  {stu?.active ?? 0}
                </span>
              </div>
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Completed</span>
                <span
                  className="db-ring-card__row-val"
                  style={{ color: "#0d9488" }}
                >
                  {completedStudents}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Capacity ring */}
        <div className="db-ring-card">
          <div className="db-ring-card__ring">
            <ProgressRing
              pct={capacityPct}
              color={
                capacityPct >= 90
                  ? "#ef4444"
                  : capacityPct >= 70
                    ? "#f59e0b"
                    : "#6366f1"
              }
            />
            <div className="db-ring-card__inner">
              <span className="db-ring-card__pct">{capacityPct}%</span>
              <span className="db-ring-card__pct-lbl">capacity</span>
            </div>
          </div>
          <div className="db-ring-card__info">
            <div className="db-ring-card__title">Supervisor Capacity</div>
            <div className="db-ring-card__rows">
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Staff ID</span>
                <span className="db-ring-card__row-val">
                  {sup?.staffId ?? "—"}
                </span>
              </div>
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Current Students</span>
                <span className="db-ring-card__row-val">
                  {sup?.currentStudents ?? 0}
                </span>
              </div>
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Max Capacity</span>
                <span className="db-ring-card__row-val">
                  {sup?.maxStudents ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info Panels ─────────────────────────────────────────────────────── */}
      <div className="db-panels">
        <InfoPanel
          title="Student Breakdown"
          sub="All statuses at a glance"
          icon={<Users size={16} />}
          iconColor="teal"
          rows={[
            { label: "Total Assigned", value: totalStudents },
            { label: "Placed", value: stu?.placed ?? 0 },
            { label: "Active (Interning)", value: stu?.active ?? 0 },
            { label: "Completed", value: completedStudents },
            { label: "Needing Evaluation", value: needingEval },
          ]}
        />
        <InfoPanel
          title="Logbook Summary"
          sub="Review queue"
          icon={<BookOpen size={16} />}
          iconColor="blue"
          rows={[
            {
              label: "Pending Review",
              value: (
                <span
                  style={{
                    color:
                      pendingLogbooks > 0
                        ? "#f59e0b"
                        : "var(--color-text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {pendingLogbooks}
                </span>
              ),
            },
          ]}
        />
        <InfoPanel
          title="My Quick Stats"
          sub="Your supervision summary"
          icon={<UserCheck size={16} />}
          iconColor="purple"
          rows={[
            { label: "Students Assigned", value: totalStudents },
            { label: "Active / Placed", value: activeStudents },
            {
              label: "Needing Evaluation",
              value: (
                <span
                  style={{
                    color: needingEval > 0 ? "#f59e0b" : "inherit",
                    fontWeight: 600,
                  }}
                >
                  {needingEval}
                </span>
              ),
            },
            {
              label: "Logbooks To Review",
              value: (
                <span
                  style={{
                    color: pendingLogbooks > 0 ? "#ef4444" : "inherit",
                    fontWeight: 600,
                  }}
                >
                  {pendingLogbooks}
                </span>
              ),
            },
            {
              label: "Pending Evaluations",
              value: d?.pendingEvaluations?.length ?? 0,
            },
            { label: "Unread Notifications", value: unreadNotifs },
          ]}
        />
      </div>

      {/* ── Department Breakdown ─────────────────────────────────────────────── */}
      {stu?.departmentBreakdown &&
        Object.keys(stu.departmentBreakdown).length > 0 && (
          <div>
            <SectionHead
              title="Department Breakdown"
              sub="Students by department"
              icon={<ClipboardList size={16} />}
              color="teal"
            />
            <div className="db-kpi-grid" style={{ marginTop: 16 }}>
              {Object.entries(stu.departmentBreakdown).map(([dept, stats]) => (
                <KpiCard
                  key={dept}
                  label={dept}
                  value={stats.total}
                  sub={`Active: ${stats.active} · Completed: ${stats.completed}`}
                  icon={<Users size={18} />}
                  color="teal"
                />
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
