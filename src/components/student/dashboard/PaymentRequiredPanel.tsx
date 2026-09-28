import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CreditCard, LogOut, RefreshCw } from "lucide-react";
import Spinner from "../../ui/Spinner/Spinner";
import {
  useMyRegistrations,
  usePayRegistration,
} from "../../../hooks/useRegistrations";
import { useLogoutUser } from "../../../hooks/useAuth";
import { findUnpaidRegistration } from "../../../helpers/registration";
import {
  getPendingRegistration,
  pendingRegistrationId,
} from "../../../helpers/pendingRegistration";
import { formatAmount } from "../../../helpers/payment";
import { durationLabel } from "../../../helpers/duration";
import "./PaymentRequiredPanel.css";

interface PaymentRequiredPanelProps {
  /** The server's own wording for the gate, when it sent one. */
  message?: string;
}

/**
 * Shown in place of the student dashboard while the registration fee is
 * unpaid — the API refuses dashboard data until then, so the useful thing to
 * offer is the way to pay.
 */
export function PaymentRequiredPanel({ message }: PaymentRequiredPanelProps) {
  const queryClient = useQueryClient();
  const { data: myRegs, isLoading: loadingRegs } = useMyRegistrations();
  const { mutate: pay, isPending: starting } = usePayRegistration();
  const { mutate: logout, isPending: loggingOut } = useLogoutUser();
  const [checking, setChecking] = useState(false);

  // Prefer the live registration list; fall back to what login stored.
  const registration = findUnpaidRegistration(myRegs?.data);
  const [stored] = useState(getPendingRegistration);
  const storedId = pendingRegistrationId(stored);

  const registrationId = registration?._id ?? storedId;
  const amount = registration?.payment?.amount ?? stored?.amount;
  const program = registration?.program ?? stored?.program;
  const period = registration?.duration
    ? durationLabel(registration.duration)
    : null;

  const canPay = Boolean(registrationId || stored?.authorizationUrl);

  const handlePay = () => {
    if (registrationId) {
      pay(registrationId, {
        onSuccess: (res) => {
          const url = res.data?.authorizationUrl;
          if (url) window.location.href = url;
        },
      });
      return;
    }
    if (stored?.authorizationUrl) window.location.href = stored.authorizationUrl;
  };

  // Payments can take a moment to confirm after returning from Credo.
  const handleRecheck = async () => {
    setChecking(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["registrations", "my"] }),
    ]);
    setChecking(false);
  };

  return (
    <div className="db-page">
      <section className="pay-gate" aria-labelledby="pay-gate-title">
        <div className="pay-gate__icon" aria-hidden="true">
          <CreditCard size={30} />
        </div>

        <h2 id="pay-gate-title" className="pay-gate__title">
          Complete your registration payment
        </h2>
        <p className="pay-gate__text">
          {message && !/registration payment/i.test(message)
            ? message
            : "Your dashboard, logbooks, and placement details unlock as soon as your registration fee is paid."}
        </p>

        {loadingRegs ? (
          <div className="pay-gate__loading">
            <Spinner
              size={16}
              color="var(--color-accent)"
              text="Finding your registration…"
            />
          </div>
        ) : canPay ? (
          (amount !== undefined || program || period) && (
            <dl className="pay-gate__details">
              {amount !== undefined && (
                <div>
                  <dt>Amount due</dt>
                  <dd className="pay-gate__amount">{formatAmount(amount)}</dd>
                </div>
              )}
              {program && (
                <div>
                  <dt>Program</dt>
                  <dd>
                    {program.type} — {program.level}
                  </dd>
                </div>
              )}
              {period && (
                <div>
                  <dt>Placement period</dt>
                  <dd>{period}</dd>
                </div>
              )}
            </dl>
          )
        ) : (
          <p className="pay-gate__notice">
            We couldn't find a registration awaiting payment. If you have
            already paid, check again in a moment. Otherwise, contact your
            coordinator.
          </p>
        )}

        <div className="pay-gate__actions">
          {canPay && (
            <button
              type="button"
              className="pay-gate__btn pay-gate__btn--primary"
              onClick={handlePay}
              disabled={starting || loadingRegs}
            >
              {starting ? (
                <Spinner size={14} color="#fff" text="" />
              ) : (
                <>
                  <CreditCard size={16} /> Pay Now
                </>
              )}
            </button>
          )}
          <button
            type="button"
            className="pay-gate__btn"
            onClick={handleRecheck}
            disabled={checking}
          >
            <RefreshCw size={15} className={checking ? "pay-gate__spin" : ""} />
            {checking ? "Checking…" : "I've already paid"}
          </button>
        </div>

        <button
          type="button"
          className="pay-gate__signout"
          onClick={() => logout()}
          disabled={loggingOut}
        >
          <LogOut size={14} /> Sign out
        </button>
      </section>
    </div>
  );
}
