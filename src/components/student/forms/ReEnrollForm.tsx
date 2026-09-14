import { useState } from "react";
import { RefreshCw, Info, ExternalLink } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import { useReEnroll } from "../../../hooks/useRegistrations";
import { usePublicDurations } from "../../../hooks/useDurations";
import { durationLabel, formatPrice } from "../../../helpers/duration";
import { toast } from "react-toastify";
import {
  PROGRAM_TYPES,
  PROGRAM_LEVELS_BY_TYPE,
} from "../../../helpers/programConstants";
import "./ReEnrollForm.css";

interface ReEnrollFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReEnrollForm({ isOpen, onClose }: ReEnrollFormProps) {
  const [programType, setProgramType] = useState("");
  const [programLevel, setProgramLevel] = useState("");
  const [durationId, setDurationId] = useState("");
  const { mutate: reEnroll, isPending } = useReEnroll();
  const { data: durationsResp, isLoading: loadingDurations } =
    usePublicDurations();

  const levels = programType ? (PROGRAM_LEVELS_BY_TYPE[programType] ?? []) : [];
  // Durations are a menu, not a ladder — any active period is fair game on
  // re-enrolment, including one this student has already done.
  const durations = durationsResp?.data ?? [];
  const selectedDuration = durations.find((d) => d._id === durationId) ?? null;

  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setProgramType(e.target.value);
    setProgramLevel(""); // reset level when type changes
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!programType || !programLevel) {
      toast.warn("Please select both programme type and level.");
      return;
    }
    if (!durationId) {
      toast.warn("Please select a placement period.");
      return;
    }
    reEnroll(
      { programType, programLevel, durationId },
      {
        onSuccess: (res) => {
          toast.success(
            res.resumed
              ? "Resumed your existing registration — proceed to payment."
              : "Re-enrollment submitted! Redirecting to payment…",
          );
          if (res.data?.authorizationUrl) {
            window.open(res.data.authorizationUrl, "_blank");
          }
          setProgramType("");
          setProgramLevel("");
          setDurationId("");
          onClose();
        },
      },
    );
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Re-enroll (Next Cycle)"
    >
      <form className="re-form" onSubmit={handleSubmit}>
        {/* Info banner */}
        <div className="re-banner">
          <span className="re-banner-icon">
            <Info size={18} />
          </span>
          <div className="re-banner-text">
            <span className="re-banner-title">Starting a new training cycle</span>
            <span className="re-banner-sub">
              Select your programme details and placement period for the
              upcoming rotation. You will be redirected to the payment gateway
              once the request is submitted.
            </span>
          </div>
        </div>

        {/* Fields */}
        <div className="re-fields">
          {/* Programme Type */}
          <div className="re-field">
            <label className="re-label" htmlFor="reEnrollProgramType">
              Programme Type
            </label>
            <select
              id="reEnrollProgramType"
              className="re-input re-select"
              value={programType}
              onChange={handleTypeChange}
              disabled={isPending}
              required
            >
              <option value="" disabled>
                Select programme type…
              </option>
              {PROGRAM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Programme Level — only shown once a type is picked */}
          {programType && (
            <div className="re-field">
              <label className="re-label" htmlFor="reEnrollProgramLevel">
                Programme Level
              </label>
              <select
                id="reEnrollProgramLevel"
                className="re-input re-select"
                value={programLevel}
                onChange={(e) => setProgramLevel(e.target.value)}
                disabled={isPending}
                required
              >
                <option value="" disabled>
                  Select level…
                </option>
                {levels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <span className="re-hint">
                Specify the year or level you will be in during the next
                rotation.
              </span>
            </div>
          )}

          {/* Placement period — this is the amount charged, so show it. */}
          <div className="re-field">
            <label className="re-label" htmlFor="reEnrollDuration">
              Placement Period
            </label>
            <select
              id="reEnrollDuration"
              className="re-input re-select"
              value={durationId}
              onChange={(e) => setDurationId(e.target.value)}
              disabled={isPending || loadingDurations}
              required
            >
              <option value="" disabled>
                {loadingDurations
                  ? "Loading periods…"
                  : "Select placement period…"}
              </option>
              {durations.map((d) => (
                <option key={d._id} value={d._id}>
                  {durationLabel(d)} — {formatPrice(d.price)}
                </option>
              ))}
            </select>
            <span className="re-hint">
              {selectedDuration
                ? `You will be charged ${formatPrice(selectedDuration.price)} for ${durationLabel(selectedDuration)}.`
                : "You may pick any available period, including one you have done before."}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="re-footer">
          <button
            type="button"
            className="re-btn-cancel"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="re-btn-submit"
            disabled={isPending || !programType || !programLevel || !durationId}
          >
            {isPending ? (
              <>
                <span className="re-spinner" />
                Submitting…
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                Submit &amp; Pay
                <ExternalLink size={12} style={{ opacity: 0.7 }} />
              </>
            )}
          </button>
        </div>
      </form>
    </CustomModal>
  );
}
