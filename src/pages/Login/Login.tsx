import { useState, type FormEvent, type ChangeEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import AuthBrandPanel, {
  type AuthFeature,
} from "../../components/auth/AuthBrandPanel";
import { useLoginUser } from "../../hooks/useAuth";
import { useAuth } from "../../context/useAuth";
import type { UserRole } from "../../api/types/auth";
import ForgotPassword from "../../components/auth/ForgotPassword";

const features: AuthFeature[] = [
  {
    icon: <CalendarDays size={22} />,
    tone: "navy",
    title: "Manage Placements",
    desc: "Register, get placed, and follow your clinical schedule.",
  },
  {
    icon: <FileText size={22} />,
    tone: "clay",
    title: "Track Performance",
    desc: "Logbooks, evaluations, quizzes, and milestones.",
  },
  {
    icon: <Users size={22} />,
    tone: "slate",
    title: "Support Growth",
    desc: "Better training. Better healthcare.",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const { mutate: login, isPending } = useLoginUser();
  const { isAuthenticated, user, isLoading } = useAuth();

  if (!isLoading && isAuthenticated && user) {
    const roleHome: Record<UserRole, string> = {
      admin: "/admin/dashboard",
      coordinator: "/admin/dashboard",
      supervisor: "/supervisor/dashboard",
      student: "/student/dashboard",
    };
    return <Navigate to={roleHome[user.role] ?? "/"} replace />;
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="auth-page">
      <AuthBrandPanel
        headline="Clinical Training."
        accent="Real-World Impact."
        lead="Manage clinical placements, submit logbooks, track your progress, and get supervisor sign-offs — all in one place."
        features={features}
      />

      {/* ── Login card ──────────────────────────────────────────────────── */}
      <section className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card__blob" aria-hidden="true" />

          <div className="auth-eyebrow">Welcome back</div>
          <h2 className="auth-title">Login to your account</h2>
          <p className="auth-sub">
            Access your dashboard and continue managing your clinical
            placement.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="auth-email" className="auth-label">
                Email Address
              </label>
              <div className="auth-input-wrap">
                <Mail size={18} className="auth-input-icon" />
                <input
                  id="auth-email"
                  type="email"
                  className="auth-input"
                  placeholder="you@institution.edu"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="auth-password" className="auth-label">
                  Password
                </label>
                <button
                  type="button"
                  className="auth-link auth-link--small"
                  onClick={() => setIsForgotOpen(true)}
                >
                  Forgot password?
                </button>
              </div>
              <div className="auth-input-wrap">
                <Lock size={18} className="auth-input-icon" />
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input auth-input--with-toggle"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={isPending}>
              {isPending ? "Logging in…" : "Log In"}
              {!isPending && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-register">
            Don't have an account?{" "}
            <button
              type="button"
              className="auth-link"
              onClick={() => navigate("/register")}
            >
              Create an account
            </button>
          </p>

          <div className="auth-card__footer">
            <span className="auth-secure">
              <ShieldCheck size={15} /> Secure &amp; Confidential
            </span>
            <Stethoscope
              size={64}
              strokeWidth={1.2}
              className="auth-stethoscope"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      <ForgotPassword
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
    </div>
  );
};

export default Login;
