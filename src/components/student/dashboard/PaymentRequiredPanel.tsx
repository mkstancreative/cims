import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CreditCard, LogOut, RefreshCw } from "lucide-react";
import Spinner from "../../ui/Spinner/Spinner";
import {
  useConfirmPayment,
  useMyRegistrations,
  usePayRegistration,
} from "../../../hooks/useRegistrations";
import { useLogoutUser } from "../../../hooks/useAuth";
import {
  apiErrorMessage,
  findUnpaidRegistration,
  paymentOutcome,
} from "../../../helpers/registration";
import {
  clearPendingRegistration,
  getPendingRegistration,
  pendingRegistrationId,
  storePendingRegistration,
} from "../../../helpers/pendingRegistration";
import { isRegistrationPaid } from "../../../api/types/registration";
import { formatAmount } from "../../../helpers/payment";
import { durationLabel } from "../../../helpers/duration";
import "./GatePanel.css";

interface PaymentRequiredPanelProps {
  /** The server's own wording for the gate, when it sent one. */
  message?: string;
}

/**
 * Shown in place of the student dashboard while the registration fee is
 * unpaid — the API refuses dashboard data until then, so the useful thing to
 * offer is the way to pay, and a way to confirm a payment already made.
 */
export function PaymentRequiredPanel({ message }: PaymentRequiredPanelProps) {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: myRegs, isLoading: loadingRegs } = useMyRegistrations();
  const {
    mutate: pay,
    mutateAsync: payAsync,
    isPending: starting,
  } = usePayRegistration();
  const { mutateAsync: confirmPayment } = useConfirmPayment();
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

  // A `?reference=` means Credo just sent the student back here.
  const returnedReference = searchParams.get("reference");
  const knownReference =
    returnedReference ??
    stored?.reference ??
    registration?.payment?.reference ??
    null;

  /** Keep the reference so a later visit can still verify this attempt. */
  const rememberReference = (reference: string) =>
    storePendingRegistration({
      ...(getPendingRegistration() ?? {}),
      ...(registrationId ? { id: registrationId } : {}),
      reference,
    });

  const unlockDashboard = () => {
    clearPendingRegistration();
    if (returnedReference) setSearchParams({}, { replace: true });
    toast.success("Payment confirmed. Loading your dashboard…", {
      toastId: "payment-confirmed",
    });
    queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["registrations"] });
  };

  /** Asks the server to verify `reference` with Credo; `quiet` skips toasts
   *  unless the payment went through. */
  const verify = async (reference: string, quiet = false) => {
    const res = await confirmPayment(reference);
    const outcome = paymentOutcome(res.data?.status);
    if (outcome === "success") return unlockDashboard();
    if (quiet) return;
    if (outcome === "pending")
      toast.info(
        "Your payment is still processing. Please check again in a few minutes.",
        { toastId: "payment-pending" },
      );
    else
      toast.error(
        "We couldn't confirm this payment. If you were debited, contact support with your payment reference.",
        { toastId: "payment-failed" },
      );
  };

  // Back from Credo (or back later after paying): verify straight away.
  const autoChecked = useRef(false);
  useEffect(() => {
    const reference = returnedReference ?? stored?.reference;
    if (!reference || autoChecked.current) return;
    autoChecked.current = true;
    setChecking(true);
    // Only speak up when Credo just returned the student here.
    verify(reference, !returnedReference)
      .catch((err) => {
        if (returnedReference)
          toast.error(apiErrorMessage(err, "Couldn't verify your payment."));
      })
      .finally(() => setChecking(false));
    // Runs once per visit; `verify` reads the latest state it needs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = () => {
    if (registrationId) {
      pay(registrationId, {
        onSuccess: (res) => {
          // Nothing left to pay — the gate just hasn't caught up yet.
          if (isRegistrationPaid(res)) return unlockDashboard();
          if (res.data?.reference) rememberReference(res.data.reference);
          const url = res.data?.authorizationUrl;
          if (url) window.location.href = url;
        },
      });
      return;
    }
    if (stored?.authorizationUrl) window.location.href = stored.authorizationUrl;
  };

  // "I've already paid": verify the payment with the server.
  const handleRecheck = async () => {
    setChecking(true);
    let stage: "lookup" | "verify" = "lookup";
    try {
      let reference = knownReference;
      // No reference on hand — the pay endpoint resumes the current attempt
      // (or says it's already paid), which gives us one to verify.
      if (!reference && registrationId) {
        const res = await payAsync(registrationId);
        if (isRegistrationPaid(res)) return unlockDashboard();
        reference = res.data?.reference ?? null;
        if (reference) rememberReference(reference);
      }
      if (!reference) {
        toast.info(
          "We couldn't find a payment to verify yet. If you just paid, please try again in a few minutes.",
        );
        return;
      }
      stage = "verify";
      await verify(reference);
    } catch (err) {
      // The pay hook already reports its own failures.
      if (stage === "verify")
        toast.error(
          apiErrorMessage(err, "Couldn't check your payment. Please try again."),
        );
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="db-page">
      <section className="gate-panel" aria-labelledby="gate-panel-title">
        <div className="gate-panel__icon" aria-hidden="true">
          <CreditCard size={30} />
        </div>

        <h2 id="gate-panel-title" className="gate-panel__title">
          Complete your registration payment
        </h2>
        <p className="gate-panel__text">
          {message && !/registration payment/i.test(message)
            ? message
            : "Your dashboard, logbooks, and placement details unlock as soon as your registration fee is paid."}
        </p>

        {loadingRegs ? (
          <div className="gate-panel__loading">
            <Spinner
              size={16}
              color="var(--color-accent)"
              text="Finding your registration…"
            />
          </div>
        ) : canPay ? (
          (amount !== undefined || program || period) && (
            <dl className="gate-panel__details">
              {amount !== undefined && (
                <div>
                  <dt>Amount due</dt>
                  <dd className="gate-panel__amount">{formatAmount(amount)}</dd>
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
          <p className="gate-panel__notice">
            We couldn't find a registration awaiting payment. If you have
            already paid, check again in a moment. Otherwise, contact your
            coordinator.
          </p>
        )}

        <div className="gate-panel__actions">
          {canPay && (
            <button
              type="button"
              className="gate-panel__btn gate-panel__btn--primary"
              onClick={handlePay}
              disabled={starting || loadingRegs || checking}
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
            className="gate-panel__btn"
            onClick={handleRecheck}
            disabled={checking}
          >
            <RefreshCw size={15} className={checking ? "gate-panel__spin" : ""} />
            {checking ? "Checking…" : "I've already paid"}
          </button>
        </div>

        <button
          type="button"
          className="gate-panel__signout"
          onClick={() => logout()}
          disabled={loggingOut}
        >
          <LogOut size={14} /> Sign out
        </button>
      </section>
    </div>
  );
}
