import React, { useState } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import MutationResult from "../../ui/MutationResult/MutationResult";
import { useUpdateStudentStatus } from "../../../hooks/useStudents";
import type {
  Student,
  ITStatus,
  UpdateStatusApiResult,
} from "../../../api/types/student";

// ── Allowed status transitions ───────────────────────────────────────────────
const STATUS_TRANSITIONS: Partial<Record<ITStatus, ITStatus[]>> = {
  placed: ["active"],
  active: ["completed", "placed"],
};
// completed is terminal — no outgoing transitions

const STATUS_META: Record<ITStatus, { label: string; color: string }> = {
  placed: { label: "Placed", color: "#1976d2" },
  active: { label: "Active (IT Ongoing)", color: "#4f46e5" },
  completed: { label: "Completed", color: "#4338ca" },
};


interface UpdateStudentStatusProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pass one student for single update, or multiple for bulk. */
  students: Student[];
}

export default function UpdateStudentStatus({
  isOpen,
  onClose,
  students,
}: UpdateStudentStatusProps) {
  const isBulkCalc = students.length > 1;
  const firstStatus = students[0]?.itStatus ?? "placed";

  // For single-student mode, compute allowed targets from the transition map.
  // For bulk mode, use the union of all allowed transitions across selected students.
  const allowedStatuses: ITStatus[] = isBulkCalc
    ? ([
        ...new Set(
          students.flatMap((s) => STATUS_TRANSITIONS[s.itStatus] ?? []),
        ),
      ] as ITStatus[])
    : (STATUS_TRANSITIONS[firstStatus] ?? []);

  const [status, setStatus] = useState<ITStatus>(
    allowedStatuses[0] ?? firstStatus,
  );
  const [result, setResult] = useState<UpdateStatusApiResult | null>(null);

  const { mutate: updateStatus, isPending } = useUpdateStudentStatus();

  const isBulk = students.length > 1;
  const isTerminal = !isBulkCalc && allowedStatuses.length === 0;
  const allSameStatus = students.every((s) => s.itStatus === status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatus(
      { updates: students.map((s) => ({ studentId: s._id, status })) },
      {
        onSuccess: (data) => {
          // Show inline result instead of closing
          setResult(data as UpdateStatusApiResult);
        },
      },
    );
  };

  // ── Result screen ─────────────────────────────────────────────────────────
  if (result) {
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title="Status Update Result"
        size="medium"
      >
        <MutationResult result={result} onClose={onClose} />
      </CustomModal>
    );
  }

  // ── Form screen ───────────────────────────────────────────────────────────
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isBulk
          ? `Update Status — ${students.length} Students`
          : "Update Student Status"
      }
      subtitle={
        isBulk
          ? "Choose one status to apply to all selected students."
          : `Change IT status for ${students[0]?.user.firstName} ${students[0]?.user.lastName}`
      }
      size="medium"
      footer={
        <>
          <button
            className="modal-cancel"
            type="button"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          {!isTerminal && (
            <button
              className="modal-submit"
              form="update-status-form"
              type="submit"
              disabled={isPending || allSameStatus}
            >
              {isPending ? (
                <Spinner size={14} color="#fff" text="" />
              ) : isBulk ? (
                `Update ${students.length} Students`
              ) : (
                "Save Status"
              )}
            </button>
          )}
        </>
      }
    >
      <form
        id="update-status-form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 18 }}
      >
        {/* ── Selected students chips ── */}
        <div>
          <p className="modal-label" style={{ marginBottom: 8 }}>
            {isBulk ? "Selected students" : "Student"}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {students.map((s) => {
              const name = `${s.user.firstName} ${s.user.lastName}`;
              return (
                <div
                  key={s._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: "var(--color-bg-secondary)",
                    border: "1px solid var(--color-border)",
                    fontSize: 12.5,
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "var(--color-accent-muted)",
                      color: "var(--color-accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    {s.user.firstName[0]}
                    {s.user.lastName[0]}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        lineHeight: 1.2,
                      }}
                    >
                      {name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-secondary)",
                        fontFamily: "monospace",
                      }}
                    >
                      {s.registrationNumber}
                    </div>
                  </div>
                  <StatusBadge status={s.itStatus} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Status radio selector ── */}
        <div className="form-group">
          <label className="modal-label">
            New IT Status <span style={{ color: "#ef4444" }}>*</span>
          </label>
          {isTerminal ? (
            <div
              style={{
                marginTop: 8,
                padding: "12px 14px",
                borderRadius: 8,
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                fontSize: 13,
                color: "var(--color-text-secondary)",
                textAlign: "center",
              }}
            >
              This student's status is <strong>Completed</strong> — no further
              transitions are allowed.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginTop: 6,
              }}
            >
              {allowedStatuses.map((value) => {
                const { label, color } = STATUS_META[value];
                const isSelected = status === value;
                return (
                  <label
                    key={value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: 8,
                      cursor: "pointer",
                      border: `1.5px solid ${
                        isSelected ? color : "var(--color-border)"
                      }`,
                      background: isSelected ? `${color}14` : "transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="radio"
                      name="itStatus"
                      value={value}
                      checked={isSelected}
                      onChange={() => setStatus(value)}
                      style={{ accentColor: color, flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? color : "var(--color-text-primary)",
                        flex: 1,
                      }}
                    >
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </form>
    </CustomModal>
  );
}
