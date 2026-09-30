import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Clock,
  History,
  RefreshCw,
  RotateCcw,
  Star,
} from "lucide-react";
import InternshipStatusBadge from "../../ui/StatusBadge/InternshipStatusBadge";
import ActionDropDown from "../../ui/ActionDropdown/ActionDropDown";
import ConfirmModal from "../../ui/ConfirmModal/ConfirmModal";
import InternshipStatusForm from "../forms/InternshipStatusForm";
import { useModal } from "../../../context/ModalContext";
import {
  useInternships,
  useSetCurrentInternship,
} from "../../../hooks/useInternships";
import { useStudentProgress } from "../../../hooks/useStudents";
import { formatDate } from "../../../helpers/utilities";
import { isAbandoned } from "../../../helpers/internship";
import type { Internship } from "../../../api/types/internship";
import { SkeletonRows } from "../../ui/Skeleton/Skeleton";
import "./StudentInternships.css";

/** formatDate that never throws — "—" for missing / invalid values. */
function safeDate(d?: string | null): string {
  if (!d) return "—";
  try {
    return formatDate(d);
  } catch {
    return "—";
  }
}

const batchName = (i: Internship) =>
  i.batch && typeof i.batch === "object" ? i.batch.name : "Batch";

// ── Progress ring ─────────────────────────────────────────────────────────────
function ProgressRing({ percent, size = 116, stroke = 10 }: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  const color =
    percent >= 75 ? "var(--color-primary)" : percent >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)" }}
      role="img"
      aria-label={`${percent}% complete`}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ transform: "rotate(90deg)", transformOrigin: "center", fontSize: 20, fontWeight: 700, fill: color }}
      >
        {percent}%
      </text>
    </svg>
  );
}

// ── Weekly heat map ───────────────────────────────────────────────────────────
const DAY = 24 * 60 * 60 * 1000;
const WEEK_STATES: Record<string, string> = {
  approved: "approved",
  submitted: "submitted",
  rejected: "rejected",
  draft: "draft",
};

/**
 * One cell per week of the internship, worked out from its dates. Weeks are
 * coloured by submission state when the API sends per-week data (`weeks`, or
 * the older `missedWeeks`); otherwise the grid shows where the placement is
 * in time — done, this week, still to come — and says the rest is missing.
 */
function WeeklyHeatMap({
  startDate,
  endDate,
  totalWeeks: apiTotal,
  weeks,
  missedWeeks,
}: {
  startDate?: string;
  endDate?: string;
  totalWeeks?: number;
  weeks?: { weekNumber: number; status: string }[];
  missedWeeks?: number[];
}) {
  // "Today", read once when the map mounts — render stays pure.
  const [now] = useState(() => Date.now());
  const start = startDate ? new Date(startDate).getTime() : NaN;
  const end = endDate ? new Date(endDate).getTime() : NaN;
  const fromDates =
    Number.isFinite(start) && Number.isFinite(end) && end > start
      ? Math.ceil((end - start) / (7 * DAY))
      : 0;
  const total = apiTotal && apiTotal > 0 ? apiTotal : fromDates;
  if (!total) return null;

  const currentWeek = Number.isFinite(start)
    ? Math.floor((now - start) / (7 * DAY)) + 1
    : 0;
  const byWeek = new Map((weeks ?? []).map((w) => [w.weekNumber, w.status]));
  const missed = new Set(missedWeeks ?? []);
  const hasSubmissionData = Boolean(weeks?.length) || missedWeeks !== undefined;

  const stateOf = (w: number) => {
    const reported = byWeek.get(w);
    if (reported) return WEEK_STATES[reported] ?? "submitted";
    if (missed.has(w)) return "missed";
    if (w > currentWeek) return "upcoming";
    if (w === currentWeek) return "current";
    // A past week with no report: missed if we know submissions, else unknown.
    return hasSubmissionData ? "missed" : "past";
  };

  const legend = hasSubmissionData
    ? ["approved", "submitted", "rejected", "missed", "current", "upcoming"]
    : ["past", "current", "upcoming"];

  return (
    <div>
      <p className="si-label">Logbook heat map</p>
      <div className="si-weeks" role="list">
        {Array.from({ length: total }, (_, i) => i + 1).map((w) => {
          const state = stateOf(w);
          return (
            <span
              key={w}
              role="listitem"
              className={`si-week si-week--${state}`}
              title={`Week ${w} — ${state}`}
              aria-label={`Week ${w}: ${state}`}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div className="si-legend">
        {legend.map((l) => (
          <span key={l}>
            <i className={`si-week si-week--${l}`} aria-hidden="true" />
            {l}
          </span>
        ))}
      </div>
      {!hasSubmissionData && (
        <p className="si-hint">
          Week-by-week submission status isn't sent by the API yet, so weeks
          show only where the placement is in time.
        </p>
      )}
    </div>
  );
}

// ── One internship's progress ─────────────────────────────────────────────────
function InternshipProgress({
  studentId,
  internship,
}: {
  studentId: string;
  internship: Internship;
}) {
  const internshipId = internship._id;
  const { data, isLoading, error } = useStudentProgress(studentId, internshipId);

  if (isLoading) return <div className="si-progress si-progress--loading">Loading progress…</div>;

  if (!data) {
    const message = (error as { response?: { data?: { message?: string } } } | null)
      ?.response?.data?.message;
    return (
      <div className="si-progress si-progress--empty">
        <AlertTriangle size={16} />
        {message ?? "No progress data for this internship yet."}
      </div>
    );
  }

  const { progress, logbookStats: lb } = data;
  const curriculum = progress.curriculum;
  // The API reports curriculum completion now; `progressPercent` is older.
  const percent = curriculum?.percent ?? progress.progressPercent ?? 0;

  return (
    <div className="si-progress">
      <div className="si-progress__top">
        <div className="si-ring">
          <ProgressRing percent={percent} />
          <span>{curriculum ? "Curriculum" : "IT progress"}</span>
        </div>

        <dl className="si-facts">
          {curriculum && (
            <div>
              <dt><BookOpen size={13} /> Subtopics approved</dt>
              <dd>{curriculum.approvedSubtopics} / {curriculum.totalSubtopics}</dd>
            </div>
          )}
          {curriculum?.submittedSubtopics !== undefined && (
            <div>
              <dt><BookOpen size={13} /> Subtopics logged</dt>
              <dd>{curriculum.submittedSubtopics} / {curriculum.totalSubtopics}</dd>
            </div>
          )}
          <div>
            <dt><Clock size={13} /> Days remaining</dt>
            <dd>{Math.max(0, progress.daysRemaining ?? 0)}</dd>
          </div>
          {progress.totalWeeks !== undefined && (
            <div>
              <dt><Clock size={13} /> Weeks completed</dt>
              <dd>{progress.weeksCompleted ?? 0} / {progress.totalWeeks}</dd>
            </div>
          )}
          <div>
            <dt><CalendarDays size={13} /> Period</dt>
            <dd>{safeDate(progress.startDate)} → {safeDate(progress.endDate)}</dd>
          </div>
        </dl>
      </div>

      <div>
        <p className="si-label">
          Logbook
          {lb.meetsRequirement !== undefined && (
            <span className={lb.meetsRequirement ? "si-ok" : "si-bad"}>
              {lb.meetsRequirement ? "Meets requirement" : "Below requirement"}
            </span>
          )}
        </p>
        <div className="si-logbook">
          {(
            [
              ["Total", lb.total, ""],
              ["Approved", lb.approved, "si-logbook--ok"],
              ["Submitted", lb.submitted, "si-logbook--pending"],
              ["Rejected", lb.rejected, "si-logbook--bad"],
            ] as const
          ).map(([label, value, cls]) => (
            <div key={label} className={`si-logbook__cell ${cls}`}>
              <strong>{value ?? 0}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <WeeklyHeatMap
        startDate={progress.startDate ?? internship.itPeriod?.startDate}
        endDate={progress.endDate ?? internship.itPeriod?.endDate}
        totalWeeks={progress.totalWeeks}
        weeks={lb.weeks}
        missedWeeks={lb.missedWeeks}
      />
    </div>
  );
}

// ── The student's internships ─────────────────────────────────────────────────
/**
 * Every internship the student has had (`GET /internships?studentId=`), each
 * with its own progress on demand. The current one opens by default.
 */
export default function StudentInternships({ studentId }: { studentId: string }) {
  const { data, isLoading, isError } = useInternships({ studentId, page: 1, limit: 50 });
  const internships: Internship[] = data?.data ?? [];
  /** Internship ids whose progress is open. `null` = not touched yet. */
  const [open, setOpen] = useState<Set<string> | null>(null);

  // Until the admin toggles anything, show the current internship open.
  const current = internships.find((i) => i.isCurrent) ?? internships[0];
  const openIds = open ?? new Set(current ? [current._id] : []);

  const { openModal, closeModal } = useModal();
  const { mutate: setCurrent, isPending: settingCurrent } =
    useSetCurrentInternship();
  const [makeCurrent, setMakeCurrent] = useState<Internship | null>(null);

  // Abandoned cycles (closed when a newer one started) sit behind a toggle so
  // the live internship stays obvious. The current one is always shown.
  const [showEarlier, setShowEarlier] = useState(false);
  const earlier = internships.filter((i) => isAbandoned(i.itStatus) && !i.isCurrent);
  const visible = showEarlier
    ? internships
    : internships.filter((i) => !earlier.includes(i));

  const toggle = (id: string) => {
    const next = new Set(openIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpen(next);
  };

  return (
    <div className="sv-section si">
      <div className="sv-section-header">
        <span className="sv-section-icon"><History size={15} /></span>
        <h3 className="sv-section-title">
          Internships {data && <span className="si-count">({data.total ?? internships.length})</span>}
        </h3>
      </div>

      {isLoading ? (
        <SkeletonRows rows={2} label="Loading internships" />
      ) : isError ? (
        <p className="si-note">Couldn't load this student's internships.</p>
      ) : internships.length === 0 ? (
        <p className="si-note">No internships yet — this student hasn't been enrolled into a batch.</p>
      ) : (
        <>
        <ul className="si-list">
          {visible.map((i) => {
            const isOpen = openIds.has(i._id);
            const panelId = `si-progress-${i._id}`;
            const abandoned = isAbandoned(i.itStatus);
            return (
              <li
                key={i._id}
                className={`si-item${isOpen ? " is-open" : ""}${abandoned ? " si-item--abandoned" : ""}`}
              >
                <div className="si-item__row">
                  <div className="si-item__main">
                    <span className="si-item__title">
                      {batchName(i)}
                      {i.isCurrent && <span className="si-current">Current</span>}
                    </span>
                    <span className="si-item__meta">
                      {i.session && <>Session {i.session} · </>}
                      {safeDate(i.itPeriod?.startDate)} → {safeDate(i.itPeriod?.endDate)}
                    </span>
                  </div>
                  <InternshipStatusBadge status={i.itStatus} />
                  <ActionDropDown
                    actions={[
                      {
                        // Re-activating is the only way out of abandoned.
                        label: abandoned ? "Restore (make active)" : "Change status",
                        icon: abandoned ? <RotateCcw size={13} /> : <RefreshCw size={13} />,
                        onClick: () =>
                          openModal(
                            <InternshipStatusForm
                              key={i._id}
                              isOpen
                              onClose={closeModal}
                              internship={i}
                            />,
                          ),
                      },
                      {
                        label: i.isCurrent ? "Current internship" : "Make current",
                        icon: <Star size={13} />,
                        onClick: () => setMakeCurrent(i),
                        disabled: i.isCurrent,
                      },
                    ]}
                  />
                  <button
                    type="button"
                    className="si-toggle"
                    onClick={() => toggle(i._id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    {isOpen ? "Hide progress" : "View progress"}
                    <ChevronDown size={14} className="si-toggle__icon" />
                  </button>
                </div>
                {isOpen && (
                  <div id={panelId}>
                    <InternshipProgress studentId={studentId} internship={i} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {earlier.length > 0 && (
          <button
            type="button"
            className="si-earlier"
            onClick={() => setShowEarlier((v) => !v)}
            aria-expanded={showEarlier}
          >
            {showEarlier
              ? "Hide earlier cycles"
              : `Show ${earlier.length} earlier cycle${earlier.length === 1 ? "" : "s"} (abandoned)`}
            <ChevronDown
              size={14}
              style={{ transform: showEarlier ? "rotate(180deg)" : undefined }}
            />
          </button>
        )}
        </>
      )}

      <ConfirmModal
        isOpen={Boolean(makeCurrent)}
        variant="warning"
        title="Make Current Internship"
        message={
          makeCurrent
            ? `Make ${batchName(makeCurrent)} (${makeCurrent.session ?? ""}) this student's current internship? Their dashboard, logbook and progress will follow it, and their other internship stops being current.`
            : ""
        }
        confirmText="Yes, Make Current"
        cancelText="Cancel"
        isPending={settingCurrent}
        onConfirm={() =>
          makeCurrent &&
          setCurrent(makeCurrent._id, { onSuccess: () => setMakeCurrent(null) })
        }
        onCancel={() => setMakeCurrent(null)}
      />
    </div>
  );
}
