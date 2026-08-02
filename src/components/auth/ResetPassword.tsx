import { useState, type FormEvent } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { KeyRound, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useResetPassword } from "../../hooks/useAuth";
import "../shared/forms/ChangePassword.css";
import "../../pages/Login/Login.css";

export default function ResetPassword() {
  const { token: pathToken } = useParams<{ token: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const queryToken = new URLSearchParams(location.search).get("token");
  const token = pathToken || queryToken;

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const { mutate: resetPassword, isPending } = useResetPassword();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    resetPassword(
      {
        token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      },
      {
        onSuccess: () => setIsSuccess(true),
      },
    );
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        background: "var(--page-bg)",
        color: "var(--color-text-primary)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="login-card"
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {isSuccess ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                width: 48,
                height: 48,
                background: "rgba(16,185,129,0.1)",
                color: "#10b981",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ marginBottom: 8, fontSize: 16 }}>
              Password Reset Successfully
            </h3>
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              Your password has been securely reset. You can now log into your
              account.
            </p>
            <button
              type="button"
              className="submit-button"
              onClick={() => navigate("/")}
            >
              Return to Login
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src="/logo.png" alt="logo" width={36} height={36} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 16 }}>
                
              </span>
            </div>

            <div
              className="login-card-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "var(--color-text-primary)",
              }}
            >
              <KeyRound size={20} /> Create New Password
            </div>
            <div className="login-card-sub" style={{ marginBottom: 24 }}>
              Enter your new password to regain access to your account.
            </div>

            {!token ? (
              <div
                style={{
                  padding: 16,
                  background: "rgba(220, 38, 38, 0.1)",
                  borderRadius: 8,
                  display: "flex",
                  gap: 10,
                  color: "#ef4444",
                }}
              >
                <AlertCircle size={20} />
                <span style={{ fontSize: 14 }}>
                  Invalid link format. No token found in the URL.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} id="reset-password-form">
                {/* New Password */}
                <div className="form-group">
                  <label
                    htmlFor="newResetPassword"
                    className="modal-label"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    New Password{" "}
                    <span className="required" style={{ color: "#ef4444" }}>
                      *
                    </span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="newResetPassword"
                      type={showPasswords.new ? "text" : "password"}
                      className="form-input"
                      style={{
                        paddingRight: 40,
                        background: "var(--color-bg-primary)",
                        color: "var(--color-text-primary)",
                        border: "1px solid var(--color-border)",
                      }}
                      value={form.newPassword}
                      onChange={(e) =>
                        handleChange("newPassword", e.target.value)
                      }
                      disabled={isPending}
                      required
                    />
                    <span
                      className="input-icon"
                      onClick={() => togglePasswordVisibility("new")}
                      style={{
                        cursor: "pointer",
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {showPasswords.new ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </span>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label
                    htmlFor="confirmResetPassword"
                    className="modal-label"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Confirm Password{" "}
                    <span className="required" style={{ color: "#ef4444" }}>
                      *
                    </span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="confirmResetPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      className="form-input"
                      style={{
                        paddingRight: 40,
                        background: "var(--color-bg-primary)",
                        color: "var(--color-text-primary)",
                        border: error
                          ? "1px solid #ef4444"
                          : "1px solid var(--color-border)",
                      }}
                      value={form.confirmPassword}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      disabled={isPending}
                      required
                    />
                    <span
                      className="input-icon"
                      onClick={() => togglePasswordVisibility("confirm")}
                      style={{
                        cursor: "pointer",
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </span>
                  </div>
                  {error && (
                    <span
                      className="form-error"
                      style={{
                        color: "#ef4444",
                        fontSize: 13,
                        marginTop: 4,
                        display: "block",
                      }}
                    >
                      {error}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-login"
                  disabled={
                    isPending || !form.newPassword || !form.confirmPassword
                  }
                  style={{
                    marginTop: 24,
                    width: "100%",
                    opacity: isPending ? 0.7 : 1,
                  }}
                >
                  {isPending ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
