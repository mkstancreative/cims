import { useState, type FormEvent } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import CustomModal from "../ui/CustomModal/CustomModal";
import { useForgotPassword } from "../../hooks/useAuth";
import "../shared/forms/ChangePassword.css";

export default function ForgotPassword({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    forgotPassword(
      { email },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
      },
    );
  };

  const handleClose = () => {
    setEmail("");
    setIsSuccess(false);
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reset Password"
      subtitle="Enter your email to receive a password reset link"
      icon={<Mail size={18} />}
    >
      <div style={{ paddingTop: 16 }}>
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
            <h3 style={{ marginBottom: 8, fontSize: 16 }}>Email Sent</h3>
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
            <button
              type="button"
              className="submit-button"
              onClick={handleClose}
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} id="forgot-password-form">
            <div className="form-group">
              <label htmlFor="resetEmail" className="modal-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="resetEmail"
                type="email"
                className="modal-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                disabled={isPending}
                required
              />
            </div>
            <button
              type="submit"
              className="submit-button"
              disabled={isPending || !email}
              style={{ marginTop: 24, background: "#2dd4bf", color: "#000"}}
            >
              {isPending ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </CustomModal>
  );
}
