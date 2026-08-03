import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, AlertTriangle } from "lucide-react";
import "../Login/Login.css";
import Spinner from "../../components/ui/Spinner/Spinner";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import {
  usePayRegistration,
  useCancelRegistration,
} from "../../hooks/useRegistrations";
import { useLogoutUser } from "../../hooks/useAuth";
import {
  getPendingRegistration,
  pendingRegistrationId,
  clearPendingRegistration,
} from "../../helpers/pendingRegistration";
import { formatAmount } from "../../helpers/payment";

/**
 * Where the `paymentRequired` login branch lands. The student is authenticated
 * but gated behind an unpaid registration, so the only ways forward are paying
 * or cancelling — there is no dashboard to fall back to.
 */
const PendingPayment = () => {
  const navigate = useNavigate();
  const appName = import.meta.env.VITE_APP_NAME;

  const [pending] = useState(getPendingRegistration);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const { mutate: pay, isPending: starting } = usePayRegistration();
  const { mutate: cancel, isPending: cancelling } = useCancelRegistration();
  const { mutate: logout } = useLogoutUser();

  const registrationId = pendingRegistrationId(pending);

  const handlePay = () => {
    // A link handed to us at login may still be live — use it and skip a round trip.
    if (pending?.authorizationUrl) {
      window.location.href = pending.authorizationUrl;
      return;
    }
    if (!registrationId) return;
    pay(registrationId, {
      onSuccess: (res) => {
        const url = res.data?.authorizationUrl;
        if (url) window.location.href = url;
      },
    });
  };

  const handleCancel = () => {
    if (!registrationId) return;
    cancel(registrationId, {
      onSuccess: () => {
        clearPendingRegistration();
        setConfirmingCancel(false);
        // Cancelling ends this gated session; a cancelled student may register again.
        logout();
      },
    });
  };

  const hasRegistration = Boolean(registrationId || pending?.authorizationUrl);

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #0d1117 0%, #111827 50%, #0d1f2d 100%)",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        className="login-card-wrapper"
        style={{ width: "100%", maxWidth: 480 }}
      >
        <div
          className="login-card"
          style={{ maxWidth: 480, textAlign: "center" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 24,
            }}
          >
            <img src="/logo.png" alt="logo" width={32} height={32} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>{appName}</span>
          </div>

          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f59e0b",
              background: "#f59e0b1a",
              border: "1px solid #f59e0b40",
            }}
          >
            {hasRegistration ? (
              <CreditCard size={44} />
            ) : (
              <AlertTriangle size={44} />
            )}
          </div>

          <div className="login-card-title">Payment Required</div>
          <div
            className="login-card-sub"
            style={{ lineHeight: 1.6, marginBottom: 24 }}
          >
            {hasRegistration
              ? "Your registration is complete but the fee has not been paid yet. Settle it to unlock your dashboard."
              : "We could not find the registration awaiting payment. Please sign in again to continue."}
          </div>

          {hasRegistration && (
            <div
              style={{
                textAlign: "left",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                padding: "14px 16px",
                marginBottom: 22,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {pending?.amount !== undefined && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 12.5, color: "#9ca3af" }}>
                    Amount
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>
                    {formatAmount(pending.amount)}
                  </span>
                </div>
              )}
              {pending?.program && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 12.5, color: "#9ca3af" }}>
                    Program
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {pending.program.type} — {pending.program.level}
                  </span>
                </div>
              )}
              {pending?.reference && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 12.5, color: "#9ca3af" }}>
                    Reference
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "monospace",
                      wordBreak: "break-all",
                      textAlign: "right",
                    }}
                  >
                    {pending.reference}
                  </span>
                </div>
              )}
            </div>
          )}

          {hasRegistration ? (
            <>
              <button
                className="btn-login"
                style={{ width: "100%" }}
                onClick={handlePay}
                disabled={starting}
              >
                {starting ? (
                  <Spinner size={14} color="#fff" text="" />
                ) : (
                  "Pay Now"
                )}
              </button>

              <button
                type="button"
                onClick={() => setConfirmingCancel(true)}
                disabled={cancelling}
                style={{
                  marginTop: 14,
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: "pointer",
                }}
              >
                Cancel this registration
              </button>
            </>
          ) : (
            <button
              className="btn-login"
              style={{ width: "100%" }}
              onClick={() => {
                clearPendingRegistration();
                navigate("/", { replace: true });
              }}
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmingCancel}
        variant="danger"
        title="Cancel Registration"
        message="Are you sure you want to cancel this registration? You will be signed out, and you can register again later."
        confirmText="Yes, Cancel It"
        cancelText="Keep It"
        isPending={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setConfirmingCancel(false)}
      />
    </div>
  );
};

export default PendingPayment;
