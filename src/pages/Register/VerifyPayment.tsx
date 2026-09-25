import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import "../Login/Login.css";
import { useVerifyPayment } from "../../hooks/useRegistrations";
import { useAuth } from "../../context/useAuth";

type Phase = "loading" | "success" | "failed" | "pending" | "missing";

const VerifyPayment = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isError } = useVerifyPayment(reference);

  const appName = import.meta.env.VITE_APP_NAME;

  const resolvePhase = (): Phase => {
    if (!reference) return "missing";
    if (isLoading) return "loading";
    if (isError || !data) return "failed";

    const status = (data.data?.status ?? "").toLowerCase();
    if (
      ["success", "successful", "paid", "completed", "new", "enrolled"].includes(
        status,
      )
    ) {
      return "success";
    }
    if (
      ["pending", "processing", "ongoing", "pending_payment"].includes(status)
    ) {
      return "pending";
    }
    return "failed";
  };

  const phase = resolvePhase();

  const config: Record<
    Phase,
    {
      icon: React.ReactNode;
      color: string;
      title: string;
      message: string;
    }
  > = {
    loading: {
      icon: <Loader2 size={48} className="vp-spin" />,
      color: "#818cf8",
      title: "Verifying your payment…",
      message: "Please wait while we confirm your transaction with Credo.",
    },
    success: {
      icon: <CheckCircle2 size={48} />,
      color: "#6366f1",
      title: "Payment Successful",
      message:
        "Your registration payment has been confirmed. Your application is now pending review by the coordinator. You will be notified once you are enrolled.",
    },
    pending: {
      icon: <AlertTriangle size={48} />,
      color: "#f59e0b",
      title: "Payment Pending",
      message:
        "Your payment is still being processed. This can take a few minutes. Please refresh this page shortly, or check back later.",
    },
    failed: {
      icon: <XCircle size={48} />,
      color: "#ef4444",
      title: "Payment Not Confirmed",
      message:
        "We could not confirm your payment. If you were debited, please contact support with your payment reference.",
    },
    missing: {
      icon: <AlertTriangle size={48} />,
      color: "#f59e0b",
      title: "No Payment Reference",
      message:
        "No payment reference was found in the link. Please use the exact link provided after registration.",
    },
  };

  const c = config[phase];

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #0d1117 0%, #111827 50%, #1e1b4b 100%)",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div className="login-card-wrapper" style={{ width: "100%", maxWidth: 480 }}>
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
              color: c.color,
              background: `${c.color}1a`,
              border: `1px solid ${c.color}40`,
            }}
          >
            {c.icon}
          </div>

          <div className="login-card-title">{c.title}</div>
          <div
            className="login-card-sub"
            style={{ lineHeight: 1.6, marginBottom: 24 }}
          >
            {c.message}
          </div>

          {reference && (
            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginBottom: 20,
                wordBreak: "break-all",
              }}
            >
              Reference:{" "}
              <span style={{ color: "#9ca3af", fontWeight: 600 }}>
                {reference}
              </span>
            </div>
          )}

          {phase === "success" && (
            <Link
              to={isAuthenticated ? "/student/dashboard" : "/"}
              className="btn-login"
              style={{ display: "block" }}
            >
              {isAuthenticated ? "Go to Dashboard" : "Continue to Sign In"}
            </Link>
          )}

          {(phase === "failed" || phase === "pending" || phase === "missing") && (
            <Link
              to={isAuthenticated ? "/student/dashboard" : "/"}
              style={{
                display: "inline-block",
                marginTop: 8,
                color: "var(--color-accent)",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              {isAuthenticated ? "Back to Dashboard" : "Back to Sign In"}
            </Link>
          )}
        </div>
      </div>

      <style>{`
        .vp-spin { animation: vp-spin 1s linear infinite; }
        @keyframes vp-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default VerifyPayment;
