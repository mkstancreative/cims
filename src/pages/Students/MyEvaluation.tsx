import { ClipboardCheck, MessageSquare } from "lucide-react";
import { useMyEvaluation } from "../../hooks/useEvaluations";
import Spinner from "../../components/ui/Spinner/Spinner";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import { GradeBadge } from "../../components/shared/dashboard/DashboardKit";
import type { EvaluationRatings } from "../../api/types/evaluation";

const RATING_LABELS: Record<keyof EvaluationRatings, string> = {
  professionalism: "Professionalism",
  technicalCompetence: "Technical Competence",
  communication: "Communication",
  initiative: "Initiative",
};

function RatingBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min((value / 5) * 100, 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          marginBottom: 5,
        }}
      >
        <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
        <span style={{ fontWeight: 700 }}>{value}/5</span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 5,
          background: "var(--color-surface-overlay)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
            borderRadius: 5,
            transition: "width .6s ease",
          }}
        />
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 150,
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: 14,
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "var(--color-text-muted)",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: accent ?? "var(--color-text-primary)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function MyEvaluation() {
  const { data, isLoading } = useMyEvaluation();

  const evaluation = data?.data?.evaluation;
  const summary = data?.data?.summary;
  const hasEvaluation = summary?.hasEvaluation && evaluation;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon purple">
            <ClipboardCheck size={20} />
          </div>
          <div>
            <h2 className="page-title">My Evaluation</h2>
            <p className="page-sub">
              Your final training assessment and supervisor ratings
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spinner
            size={28}
            color="var(--color-accent)"
            text="Loading evaluation…"
          />
        </div>
      ) : !hasEvaluation ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "var(--color-text-muted)",
          }}
        >
          <ClipboardCheck
            size={40}
            style={{ opacity: 0.4, marginBottom: 12 }}
          />
          <p>
            Your evaluation has not been completed yet. Results will appear here
            once your supervisor and assessment are finalized.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Summary tiles */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <StatTile
              label="Final Score"
              value={evaluation.finalScore ?? summary?.finalScore ?? "—"}
              accent="#10b981"
            />
            <StatTile
              label="Final Grade"
              value={
                evaluation.finalGrade || summary?.finalGrade ? (
                  <GradeBadge
                    grade={(evaluation.finalGrade ?? summary?.finalGrade)!}
                  />
                ) : (
                  "—"
                )
              }
            />
            <StatTile
              label="Quiz Score"
              value={evaluation.quizScore ?? "—"}
              accent="#6366f1"
            />
            <StatTile
              label="Status"
              value={<StatusBadge status={evaluation.status} />}
            />
          </div>

          {/* Ratings breakdown */}
          {evaluation.ratings && (
            <div
              style={{
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: 16,
                padding: 22,
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 16,
                  color: "var(--color-text-primary)",
                }}
              >
                Supervisor Ratings
              </h3>
              {(
                Object.keys(RATING_LABELS) as Array<keyof EvaluationRatings>
              ).map((key) => (
                <RatingBar
                  key={key}
                  label={RATING_LABELS[key]}
                  value={evaluation.ratings?.[key] ?? 0}
                />
              ))}
            </div>
          )}

          {/* Comments */}
          {evaluation.comments && (
            <div
              style={{
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: 16,
                padding: 22,
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--color-text-primary)",
                }}
              >
                <MessageSquare size={16} /> Supervisor Comments
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "var(--color-text-muted)",
                }}
              >
                {evaluation.comments}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
