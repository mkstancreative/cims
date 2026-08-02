import { useState } from "react";
import {
  Award,
  Loader2,
  SlidersHorizontal,
  MessageSquare,
} from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import { useSubmitEvaluation } from "../../../hooks/useEvaluations";
import type { EvaluationRatings } from "../../../api/types/evaluation";

// ─── Rating slider ──────────────────────────────────────────────────────────

const RATING_MAX = 25;

interface RatingSliderProps {
  label: string;
  description: string;
  field: keyof EvaluationRatings;
  value: number;
  onChange: (field: keyof EvaluationRatings, val: number) => void;
  disabled?: boolean;
}

function RatingSlider({
  label,
  description,
  field,
  value,
  onChange,
  disabled,
}: RatingSliderProps) {
  const pct = Math.round((value / RATING_MAX) * 100);
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="sef-rating-row">
      <div className="sef-rating-header">
        <div>
          <span className="sef-rating-label">{label}</span>
          <span className="sef-rating-desc">{description}</span>
        </div>
        <span className="sef-rating-score" style={{ color }}>
          {value}
          <span className="sef-rating-max">/{RATING_MAX}</span>
        </span>
      </div>
      <div className="sef-slider-wrap">
        <input
          type="range"
          min={0}
          max={RATING_MAX}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(field, Number(e.target.value))}
          className="sef-slider"
          style={{ "--pct": `${pct}%`, "--clr": color } as React.CSSProperties}
        />
        <div className="sef-slider-labels">
          <span>0</span>
          <span>{RATING_MAX / 2}</span>
          <span>{RATING_MAX}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

interface SubmitEvaluationFormProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onSuccess?: () => void;
}

const DEFAULT_RATINGS: EvaluationRatings = {
  professionalism: 15,
  technicalCompetence: 15,
  communication: 15,
  initiative: 15,
};

const RATING_FIELDS: Array<{
  field: keyof EvaluationRatings;
  label: string;
  description: string;
}> = [
  {
    field: "professionalism",
    label: "Professionalism",
    description: "Conduct, punctuality, and workplace attitude",
  },
  {
    field: "technicalCompetence",
    label: "Technical Competence",
    description: "Practical skills and task execution",
  },
  {
    field: "communication",
    label: "Communication",
    description: "Clarity, collaboration, and reporting",
  },
  {
    field: "initiative",
    label: "Initiative",
    description: "Proactivity, problem-solving, and drive",
  },
];

export default function SubmitEvaluationForm({
  isOpen,
  onClose,
  studentId,
  studentName,
  onSuccess,
}: SubmitEvaluationFormProps) {
  const [ratings, setRatings] = useState<EvaluationRatings>(DEFAULT_RATINGS);
  const [comments, setComments] = useState("");

  const { mutate: submit, isPending } = useSubmitEvaluation();

  const totalScore =
    ratings.professionalism +
    ratings.technicalCompetence +
    ratings.communication +
    ratings.initiative;

  const handleChange = (field: keyof EvaluationRatings, val: number) => {
    setRatings((prev) => ({ ...prev, [field]: val }));
  };

  const resetForm = () => {
    setRatings(DEFAULT_RATINGS);
    setComments("");
  };

  const handleSubmit = () => {
    submit(
      {
        studentId,
        payload: { ratings, comments: comments.trim() || undefined },
      },
      {
        onSuccess: () => {
          resetForm();
          onSuccess?.();
        },
      },
    );
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Submit Evaluation"
      subtitle={studentName}
      icon={<Award size={16} />}
      size="medium"
    >
      <div className="sef-form">
        {/* Total score preview */}
        <div className="sef-score-preview">
          <SlidersHorizontal size={14} />
          <span>Total score preview:</span>
          <strong className="sef-total-score">{totalScore} / 100</strong>
        </div>

        {/* Rating sliders */}
        <div className="sef-ratings">
          {RATING_FIELDS.map((f) => (
            <RatingSlider
              key={f.field}
              label={f.label}
              description={f.description}
              field={f.field}
              value={ratings[f.field]}
              onChange={handleChange}
              disabled={isPending}
            />
          ))}
        </div>

        {/* Comments */}
        <div className="form-group">
          <label className="modal-label">
            <MessageSquare
              size={12}
              style={{ display: "inline", marginRight: 4 }}
            />
            Supervisor Comments
          </label>
          <textarea
            className="modal-input"
            rows={4}
            placeholder="Describe your overall assessment of the student's performance…"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-cancel"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="modal-submit"
            disabled={isPending}
            onClick={handleSubmit}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            {isPending ? (
              <>
                <Loader2
                  size={13}
                  style={{ animation: "spin .8s linear infinite" }}
                />
                Submitting…
              </>
            ) : (
              <>
                <Award size={13} /> Submit Evaluation
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .sef-form{display:flex;flex-direction:column;gap:20px}
        .sef-score-preview{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--color-text-secondary);padding:10px 14px;background:var(--color-bg-secondary);border:1px solid var(--color-border);border-radius:10px}
        .sef-total-score{font-size:18px;color:var(--color-accent);margin-left:auto}
        .sef-ratings{display:flex;flex-direction:column;gap:16px}
        .sef-rating-row{display:flex;flex-direction:column;gap:8px;padding:14px;border:1px solid var(--color-border);border-radius:12px;background:var(--color-bg-primary)}
        .sef-rating-header{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
        .sef-rating-label{display:block;font-size:13px;font-weight:700;color:var(--color-text-primary)}
        .sef-rating-desc{display:block;font-size:11.5px;color:var(--color-text-secondary);margin-top:2px}
        .sef-rating-score{font-size:22px;font-weight:700;white-space:nowrap;flex-shrink:0;transition:color .2s}
        .sef-rating-max{font-size:13px;font-weight:500;opacity:.6}
        .sef-slider-wrap{display:flex;flex-direction:column;gap:4px}
        .sef-slider{width:100%;-webkit-appearance:none;height:6px;border-radius:20px;background:linear-gradient(to right,var(--clr) var(--pct),var(--color-border) var(--pct));outline:none;cursor:pointer}
        .sef-slider:disabled{opacity:.5;cursor:not-allowed}
        .sef-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--clr);box-shadow:0 1px 6px rgba(0,0,0,.2);cursor:pointer;transition:transform .15s}
        .sef-slider::-webkit-slider-thumb:hover{transform:scale(1.15)}
        .sef-slider-labels{display:flex;justify-content:space-between;font-size:10.5px;color:var(--color-text-secondary)}
      `}</style>
    </CustomModal>
  );
}
