import type { ReactNode } from "react";
import "./AuthLayout.css";
import heroImage from "../../assets/login-hero.webp";

export interface AuthFeature {
  icon: ReactNode;
  tone: "navy" | "clay" | "slate";
  title: string;
  desc: string;
}

interface AuthBrandPanelProps {
  headline: ReactNode;
  accent: ReactNode;
  lead: string;
  features: AuthFeature[];
}

/** Left half of the login / register pages: logo, pitch, photo and wave. */
export default function AuthBrandPanel({
  headline,
  accent,
  lead,
  features,
}: AuthBrandPanelProps) {
  const appName = import.meta.env.VITE_APP_NAME;

  return (
    <section className="auth-brand">
      <div
        className="auth-brand__photo"
        style={{ backgroundImage: `url(${heroImage})` }}
        aria-hidden="true"
      />
      <div className="auth-brand__fade" aria-hidden="true" />

      <figure className="auth-quote" aria-hidden="true">
        <span className="auth-quote__mark">“</span>
        <blockquote>
          Skilled interns.
          <br />
          Stronger healthcare
          <br />
          systems.
        </blockquote>
        <svg className="auth-scribble" viewBox="0 0 80 10" fill="none">
          <path
            d="M2 8C20 3 50 1 78 3"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </figure>

      <div className="auth-brand__content">
        <div className="auth-logo">
          <img src="/logo.png" alt="" width={52} height={52} />
          <div>
            <div className="auth-logo__name">{appName}</div>
            <div className="auth-logo__sub">
              Clinical Internship Management System
            </div>
          </div>
        </div>

        <h1 className="auth-headline">
          {headline}
          <br />
          <span>{accent}</span>
        </h1>
        <p className="auth-lead">{lead}</p>

        <ul className="auth-features">
          {features.map((f) => (
            <li key={f.title} className="auth-feature">
              <span
                className={`auth-feature__icon auth-feature__icon--${f.tone}`}
              >
                {f.icon}
              </span>
              <span>
                <span className="auth-feature__title">{f.title}</span>
                <span className="auth-feature__desc">{f.desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="auth-wave" aria-hidden="true">
        <svg viewBox="0 0 520 330" preserveAspectRatio="none">
          <path d="M0 0C120 30 260 90 360 170C430 226 480 280 520 330H0Z" />
        </svg>
        <p className="auth-wave__text">
          Empowering
          <br />
          healthcare through
          <br />
          structured learning.
        </p>
        <svg
          className="auth-scribble auth-scribble--wave"
          viewBox="0 0 100 10"
          fill="none"
        >
          <path
            d="M2 8C25 3 60 1 98 3"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </section>
  );
}
