import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  CircleX,
  Hourglass,
  RefreshCw,
  CreditCard,
  UserPlus,
  GraduationCap,
} from "lucide-react";
import Spinner from "../../ui/Spinner/Spinner";
import ReEnrollForm from "../forms/ReEnrollForm";
import { useMyRegistrations } from "../../../hooks/useRegistrations";
import {
  institutionName,
  latestRegistration,
} from "../../../helpers/registration";
import { durationLabel } from "../../../helpers/duration";
import "./GatePanel.css";

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

/**
 * Shown in place of the student dashboard when the student has no current
 * internship — typically just paid and waiting for the coordinator to enrol
 * them into a batch. The dashboard API has nothing to return until then.
 */
export function EnrolmentPendingPanel() {
  const queryClient = useQueryClient();
  const { data: myRegs, isLoading } = useMyRegistrations();
  const [checking, setChecking] = useState(false);
  const [reEnrollOpen, setReEnrollOpen] = useState(false);

  const registration = latestRegistration(myRegs?.data);
  const status = registration?.status ?? "new";
  const rejected = status === "rejected";
  const enrolled = status === "enrolled";

  const institution = registration ? institutionName(registration) : "—";
  const period = registration?.duration
    ? durationLabel(registration.duration)
    : null;

  const handleRecheck = async () => {
    setChecking(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["registrations", "my"] }),
    ]);
    setChecking(false);
  };

  const title = rejected
    ? "Registration not approved"
    : enrolled
      ? "You're enrolled — your placement starts soon"
      : "Payment received — awaiting enrolment";

  const text = rejected
    ? "Your coordinator could not approve this registration. You can submit a new one for the next cycle."
    : enrolled
      ? "You've been placed in a batch. Your dashboard, logbooks, and progress tracking open once your placement begins."
      : "Your coordinator is reviewing your registration and will place you in a batch. Your dashboard opens as soon as you're enrolled.";

  const steps = [
    { label: "Registered", icon: <UserPlus size={15} />, done: true },
    { label: "Paid", icon: <CreditCard size={15} />, done: true },
    { label: "Enrolled", icon: <GraduationCap size={15} />, done: enrolled },
  ];

  return (
    <div className="db-page">
      <section className="gate-panel" aria-labelledby="enrol-gate-title">
        <div
          className={`gate-panel__icon ${
            rejected ? "gate-panel__icon--danger" : "gate-panel__icon--progress"
          }`}
          aria-hidden="true"
        >
          {rejected ? <CircleX size={30} /> : <Hourglass size={30} />}
        </div>

        <h2 id="enrol-gate-title" className="gate-panel__title">
          {title}
        </h2>
        <p className="gate-panel__text">{text}</p>

        {!rejected && (
          <ol className="gate-panel__steps" aria-label="Registration progress">
            {steps.map((step, i) => {
              const current = !step.done && steps[i - 1]?.done;
              return (
                <li
                  key={step.label}
                  className={`gate-panel__step${step.done ? " is-done" : ""}${
                    current ? " is-current" : ""
                  }`}
                  aria-current={current ? "step" : undefined}
                >
                  <span className="gate-panel__step-dot" aria-hidden="true">
                    {step.done ? <Check size={15} /> : step.icon}
                  </span>
                  {step.label}
                </li>
              );
            })}
          </ol>
        )}

        {rejected && registration?.rejectionReason && (
          <div className="gate-panel__reason">
            <strong>Reason</strong>
            {registration.rejectionReason}
          </div>
        )}

        {isLoading ? (
          <div className="gate-panel__loading">
            <Spinner
              size={16}
              color="var(--color-accent)"
              text="Loading your registration…"
            />
          </div>
        ) : (
          registration && (
            <dl className="gate-panel__details">
              <div>
                <dt>Program</dt>
                <dd>
                  {registration.program.type} — {registration.program.level}
                </dd>
              </div>
              {period && (
                <div>
                  <dt>Placement period</dt>
                  <dd>{period}</dd>
                </div>
              )}
              {institution !== "—" && (
                <div>
                  <dt>Institution</dt>
                  <dd>{institution}</dd>
                </div>
              )}
              {formatDate(registration.createdAt) && (
                <div>
                  <dt>Submitted</dt>
                  <dd>{formatDate(registration.createdAt)}</dd>
                </div>
              )}
            </dl>
          )
        )}

        <div className="gate-panel__actions">
          {rejected ? (
            <button
              type="button"
              className="gate-panel__btn gate-panel__btn--primary"
              onClick={() => setReEnrollOpen(true)}
            >
              <RefreshCw size={16} /> Register again
            </button>
          ) : (
            <button
              type="button"
              className="gate-panel__btn gate-panel__btn--primary"
              onClick={handleRecheck}
              disabled={checking}
            >
              <RefreshCw
                size={16}
                className={checking ? "gate-panel__spin" : ""}
              />
              {checking ? "Checking…" : "Check status"}
            </button>
          )}
          <Link to="/student/internships" className="gate-panel__btn">
            My internships
          </Link>
        </div>
      </section>

      <ReEnrollForm
        isOpen={reEnrollOpen}
        onClose={() => setReEnrollOpen(false)}
      />
    </div>
  );
}
