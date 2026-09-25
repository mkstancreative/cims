import { useState, type FormEvent, type ChangeEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./Login.css";
import { useLoginUser } from "../../hooks/useAuth";
import { useAuth } from "../../context/useAuth";
import type { UserRole } from "../../api/types/auth";
import ForgotPassword from "../../components/auth/ForgotPassword";

const ApexULanding = () => {
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

  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="3"
            width="7"
            height="5"
            rx="1"
            stroke="#818cf8"
            strokeWidth="1.5"
          />
          <rect
            x="3"
            y="10"
            width="7"
            height="5"
            rx="1"
            stroke="#818cf8"
            strokeWidth="1.5"
          />
          <rect
            x="13"
            y="3"
            width="8"
            height="12"
            rx="1"
            stroke="#818cf8"
            strokeWidth="1.5"
          />
          <path
            d="M3 18h18"
            stroke="#818cf8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      title: "Placement Management",
      desc: "Seamlessly register, track, and manage your industrial attachment placements from one centralised dashboard.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="7" r="3" stroke="#818cf8" strokeWidth="1.5" />
          <circle cx="15" cy="7" r="3" stroke="#818cf8" strokeWidth="1.5" />
          <path
            d="M3 19c0-3.314 2.686-6 6-6h6c3.314 0 6 2.686 6 6"
            stroke="#818cf8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      title: "Supervisor Coordination",
      desc: "Connect students, institutional supervisors, and industry-based supervisors in a single collaborative workspace.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3l2.5 5.5L21 9.5l-4.5 4.5 1 6.5L12 17.5 6.5 20.5l1-6.5L3 9.5l6.5-1L12 3z"
            stroke="#818cf8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Verifiable Records",
      desc: "Generate and submit reports, evaluations, and completion certificates digitally — with public verification.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#818cf8" strokeWidth="1.5" />
          <path
            d="M2 12h4M18 12h4M12 2v4M12 18v4"
            stroke="#818cf8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      title: "Logbook Submission",
      desc: "Submit and review weekly logbook entries online — no printing, no lost pages, instant supervisor feedback.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l2 4 4.5.5-3.25 3.25.75 4.5L12 12l-4 2.25.75-4.5L5.5 6.5 10 6z"
            stroke="#818cf8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="17" cy="17" r="4" stroke="#818cf8" strokeWidth="1.5" />
          <path
            d="M15.5 17l1 1 2-2"
            stroke="#818cf8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Assessment & Grading",
      desc: "Automated grading workflows for student performance, supervisor evaluations, and final placement scores.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect
            x="5"
            y="2"
            width="14"
            height="20"
            rx="2"
            stroke="#818cf8"
            strokeWidth="1.5"
          />
          <path
            d="M9 6h6M9 10h6M9 14h4"
            stroke="#818cf8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      title: "Real-Time Notifications",
      desc: "Stay on top of deadlines, visit schedules, and assessment reminders with instant alerts across all devices.",
    },
  ];

  const stats = [
    { value: "18,000+", label: "Registered Students" },
    { value: "500+", label: "Partner Institutions" },
    { value: "94%", label: "Placement Rate" },
    { value: "36", label: "States Covered" },
  ];

  const appName = import.meta.env.VITE_APP_NAME;
  return (
    <div
      style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        background:
          "linear-gradient(135deg, #0d1117 0%, #111827 50%, #1e1b4b 100%)",
        color: "#fff",
        minHeight: "100vh",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, #0d1117 0%, #111827 50%, #1e1b4b 100%)",
        }}
      >
        {/* HERO */}
        <section className="hero-section">
          <div>
            <div className="nav-badge">Clinical Placement Management System</div>
            <h1 className="hero-title">
              Your Clinical
              <br />
              Placement.
              <br />
              <span className="hero-title-accent">Simplified.</span>
            </h1>
            <p className="hero-desc">
              The {appName} is FMC's all-in-one platform for managing clinical
              placements. Register, submit logbooks, complete your curriculum and
              quizzes, and get supervisor sign-offs — all in one place.
            </p>
            <div style={{ marginBottom: "32px" }}>
              <a
                href="https://fpno.edu.ng/"
                target="_blank"
                rel="noreferrer"
                className="hero-link-btn"
              >
                Visit School Website
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2 2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
            <div className="avatar-group">
              <div className="avatar-stack">
                {[
                  { initials: "AO", bg: "#7c3aed" },
                  { initials: "CE", bg: "#2563eb" },
                  { initials: "BU", bg: "#dc2626" },
                  { initials: "FK", bg: "#4f46e5" },
                ].map((av, i) => (
                  <div
                    key={i}
                    className="avatar"
                    style={{ background: av.bg, zIndex: 4 - i }}
                  >
                    {av.initials}
                  </div>
                ))}
              </div>
              <div className="stars">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
              <span className="trusted-text">Trusted by 18,000+ students</span>
            </div>
          </div>

          {/* Login Form */}
          <div className="login-card-wrapper">
            <div className="login-card">
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
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {appName}
                </span>
              </div>

              <div className="login-card-title">Welcome back</div>
              <div className="login-card-sub">
                Sign in to your FMC CIMS account
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <div className="form-input-wrap">
                    <input
                      type="email"
                      className="form-input"
                      placeholder="you@university.edu"
                      style={{ paddingRight: 40 }}
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setEmail(e.target.value)
                      }
                      required
                      autoComplete="email"
                    />
                    <span className="input-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M22 6l-10 7L2 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="form-input-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      placeholder="Enter your password"
                      style={{ paddingRight: 40 }}
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                      }
                      required
                      autoComplete="current-password"
                    />
                    <span
                      className="input-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M1 1l22 22"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      )}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button" // Important so it doesn't trigger form submit
                      className="forgot-link"
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                      onClick={() => setIsForgotOpen(true)}
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-login"
                  disabled={isPending}
                >
                  {isPending ? "Signing in…" : "Sign In"}
                </button>

                <div
                  style={{ marginTop: 20, textAlign: "center", fontSize: 14 }}
                >
                  <span style={{ color: "var(--color-text-muted)" }}>
                    Don't have an account?{" "}
                  </span>
                  <button
                    type="button"
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-accent)",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                    }}
                    onClick={() => navigate("/register")}
                  >
                    Register here
                  </button>
                </div>

                <div className="login-divider">
                  <div className="login-divider-line" />
                  <div className="login-divider-line" />
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <div className="stats-bar">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="stat-bar-value">{s.value}</div>
              <div className="stat-bar-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* FEATURES */}
        <section className="features-section">
          <div className="section-badge">Portal Features</div>
          <h2 className="section-title">Everything You Need to Succeed</h2>
          <p className="section-desc">
            A complete clinical placement management system with every tool students,
            supervisors, and institutions need.
          </p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 12v5c3 3 9 3 12 0v-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="cta-title">Ready to Begin Your Placement?</h2>
          <p className="cta-desc">
            Join thousands of students who manage their clinical placement
            experience seamlessly through our portal.
          </p>
          <div className="cta-buttons">
            <button
              className="btn-cta-primary"
              onClick={() => navigate("/register")}
            >
              Start Your Registration
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="trust-badges">
            {[
              "Verifiable records",
              "Free for students",
              "24/7 online access",
            ].map((t, i) => (
              <div key={i} className="trust-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 11.08V12a10 10 0 11-5.93-9.14"
                    stroke="var(--color-accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M22 4L12 14.01l-3-3"
                    stroke="var(--color-accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t}
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3L22 9v6l-10 6L2 15V9z"
                  fill="var(--color-text-primary)"
                />
              </svg>
            </div>
            <span className="footer-logo-text">FMC CIMS</span>
            <span className="footer-sub">Clinical Placement Portal</span>
          </div>
          <div className="footer-copy">
            © 2026 {appName}. All rights reserved.
          </div>
        </footer>
      </div>

      <ForgotPassword
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
    </div>
  );
};

export default ApexULanding;
