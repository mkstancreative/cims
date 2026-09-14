import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardCheck,
  Info,
  Lock,
  LockOpen,
  Save,
  Square,
  CheckSquare,
  XSquare,
} from "lucide-react";
import {
  useQuizSession,
  useMarkQuizAttendance,
  useUnlockQuizSession,
  useCloseQuizSession,
} from "../../hooks/useQuizSessions";
import Spinner from "../../components/ui/Spinner/Spinner";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import { useAuth } from "../../context/useAuth";
import type {
  QuizAttendanceRecord,
  QuizSession,
} from "../../api/types/quizSession";
import { MAX_ATTENDANCE_RECORDS } from "../../api/types/quizSession";
import "./RollCall.css";

function refId(ref: unknown): string {
  if (typeof ref === "string") return ref;
  if (ref && typeof ref === "object") {
    return String((ref as { _id?: string })._id ?? "");
  }
  return "";
}

function studentName(record: QuizAttendanceRecord): string {
  const s = record.student;
  if (s && typeof s === "object" && s.user) {
    return `${s.user.firstName} ${s.user.lastName}`.trim();
  }
  return "Unnamed student";
}

function studentRegNumber(record: QuizAttendanceRecord): string {
  const s = record.student;
  if (s && typeof s === "object") return s.registrationNumber ?? "—";
  return "—";
}

function batchName(session?: QuizSession | null): string {
  const b = session?.batch;
  if (b && typeof b === "object") return b.name;
  return "this batch";
}

function quizTitle(session?: QuizSession | null): string | null {
  const q = session?.quiz;
  if (q && typeof q === "object") return q.title;
  return null;
}

/**
 * The roll-call sheet. Mark who is physically present, save the whole roll in
 * one request, then unlock — only the students marked present can take the
 * quiz. Reached by admin, coordinator, and the batch's own supervisor.
 */
export default function RollCall() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuizSession(id);
  const session = data?.data ?? null;

  const { mutate: save, isPending: saving } = useMarkQuizAttendance();
  const { mutate: unlock, isPending: unlocking } = useUnlockQuizSession();
  const { mutate: close, isPending: closing } = useCloseQuizSession();

  const [confirmClose, setConfirmClose] = useState(false);

  /**
   * Unsaved marks only, keyed on internship id like the API. Everything else
   * reads straight off the server roll, so a student added mid-sitting shows
   * up with their real state without any re-seeding.
   */
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const records = session?.records ?? [];

  const isPresent = (record: QuizAttendanceRecord) => {
    const key = refId(record.internship);
    return overrides[key] ?? record.present;
  };

  const rolePrefix = user?.role === "supervisor" ? "/supervisor" : "/admin";

  const status = session?.status;
  const editable = status === "open" || status === "unlocked";

  const total = records.length;
  const presentCount = records.filter(isPresent).length;
  const absentCount = total - presentCount;

  const dirty = records.some((r) => isPresent(r) !== r.present);

  const setAll = (present: boolean) => {
    const next: Record<string, boolean> = {};
    records.forEach((r) => {
      const key = refId(r.internship);
      if (key) next[key] = present;
    });
    setOverrides(next);
  };

  const handleSave = () => {
    const payload = records
      .map((r) => ({
        internshipId: refId(r.internship),
        present: isPresent(r),
      }))
      .filter((r) => r.internshipId);

    // The API caps one call at 1000 records; a batch never gets near that,
    // but chunking beats a silently rejected save if one ever does.
    for (let i = 0; i < payload.length; i += MAX_ATTENDANCE_RECORDS) {
      save(
        { id, records: payload.slice(i, i + MAX_ATTENDANCE_RECORDS) },
        // Drop the local marks once they are the server's: the refetched roll
        // is then the single source of truth again.
        { onSuccess: () => setOverrides({}) },
      );
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spinner size={28} color="var(--color-accent)" text="Loading roll…" />
        </div>
      </div>
    );
  }

  if (isError || !session) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? "This sitting could not be loaded.";
    return (
      <div className="page-container">
        <div className="rc-empty">{message}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <ClipboardCheck size={20} />
          </div>
          <div>
            <h2 className="page-title">
              Roll Call — Sitting {session.sitting}
            </h2>
            <p className="page-sub">
              {batchName(session)}
              {quizTitle(session) ? ` · ${quizTitle(session)}` : ""}{" "}
              <StatusBadge status={status ?? "open"} />
            </p>
          </div>
        </div>
        <div className="page-header-right">
          <button
            type="button"
            className="rc-btn"
            onClick={() => navigate(`${rolePrefix}/quiz-sittings`)}
          >
            <ArrowLeft size={15} />
            All sittings
          </button>
        </div>
      </div>

      {status === "open" && (
        <div className="rc-banner">
          <Info size={14} />
          <span>
            Attendance is being taken — students see the quiz as locked until
            you unlock this sitting.
          </span>
        </div>
      )}

      {status === "unlocked" && (
        <div className="rc-banner">
          <Info size={14} />
          <span>
            The quiz is live for the students marked present. A latecomer can
            still be marked and saved while the sitting is open.
          </span>
        </div>
      )}

      {status === "closed" && (
        <div className="rc-banner rc-banner--warn">
          <Info size={14} />
          <span>
            This sitting is closed and cannot be reopened — the roll is the
            attendance register of record. Open a new sitting to serve students
            who missed this one.
          </span>
        </div>
      )}

      {/* ── Summary ── */}
      <div className="rc-summary">
        <div className="rc-stat">
          <span className="rc-stat-label">On the roll</span>
          <span className="rc-stat-value">{total}</span>
        </div>
        <div className="rc-stat">
          <span className="rc-stat-label">Present</span>
          <span className="rc-stat-value present">{presentCount}</span>
        </div>
        <div className="rc-stat">
          <span className="rc-stat-label">Absent</span>
          <span className="rc-stat-value absent">{absentCount}</span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="rc-actions">
        <button
          type="button"
          className="rc-btn"
          onClick={() => setAll(true)}
          disabled={!editable || total === 0}
        >
          <CheckSquare size={15} />
          Mark all present
        </button>
        <button
          type="button"
          className="rc-btn"
          onClick={() => setAll(false)}
          disabled={!editable || total === 0}
        >
          <XSquare size={15} />
          Mark all absent
        </button>

        <span className="rc-spacer" />

        {dirty && <span className="rc-dirty">Unsaved changes</span>}

        <button
          type="button"
          className="rc-btn rc-btn--primary"
          onClick={handleSave}
          disabled={!editable || saving || !dirty}
        >
          {saving ? (
            <Spinner size={14} color="#fff" text="" />
          ) : (
            <>
              <Save size={15} />
              Save attendance
            </>
          )}
        </button>

        {status === "open" && (
          <button
            type="button"
            className="rc-btn rc-btn--primary"
            onClick={() => unlock(id)}
            // The API refuses an unlock with nobody present; disabling here
            // says why before they find out the hard way.
            disabled={unlocking || presentCount === 0 || dirty}
            title={
              presentCount === 0
                ? "Mark at least one student present first"
                : dirty
                  ? "Save attendance before unlocking"
                  : undefined
            }
          >
            {unlocking ? (
              <Spinner size={14} color="#fff" text="" />
            ) : (
              <>
                <LockOpen size={15} />
                Unlock quiz
              </>
            )}
          </button>
        )}

        {editable && (
          <button
            type="button"
            className="rc-btn rc-btn--danger"
            onClick={() => setConfirmClose(true)}
            disabled={closing}
          >
            <Lock size={15} />
            Close sitting
          </button>
        )}
      </div>

      {/* ── Roll ── */}
      {total === 0 ? (
        <div className="rc-empty">
          No students are on this roll yet.
        </div>
      ) : (
        <div className="rc-list">
          {records.map((record) => {
            const key = refId(record.internship);
            const present = isPresent(record);
            return (
              <div
                key={key || refId(record.student)}
                className={`rc-row${present ? " present" : ""}`}
              >
                <div className="rc-row-body">
                  <div className="rc-name">{studentName(record)}</div>
                  <div className="rc-meta">
                    {studentRegNumber(record)}
                    {record.markedAt
                      ? ` · marked ${new Date(record.markedAt).toLocaleTimeString()}`
                      : ""}
                  </div>
                </div>
                <button
                  type="button"
                  className={`rc-toggle${present ? " on" : ""}`}
                  onClick={() =>
                    setOverrides((prev) => ({ ...prev, [key]: !present }))
                  }
                  disabled={!editable || !key}
                  aria-pressed={present}
                >
                  {present ? <CheckSquare size={17} /> : <Square size={17} />}
                  {present ? "Present" : "Absent"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmClose}
        variant="danger"
        title="Close Sitting"
        message={`Close sitting ${session.sitting} for ${batchName(session)}? A closed sitting can never be reopened, and any submit still in flight will be refused. Close only after the submissions have landed.`}
        confirmText="Yes, Close Sitting"
        cancelText="Cancel"
        isPending={closing}
        onConfirm={() =>
          close(id, { onSuccess: () => setConfirmClose(false) })
        }
        onCancel={() => setConfirmClose(false)}
      />
    </div>
  );
}
