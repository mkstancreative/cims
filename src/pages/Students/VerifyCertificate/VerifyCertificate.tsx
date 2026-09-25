import { useSearchParams, Link, useParams } from "react-router-dom";
import {
  XCircle,
  GraduationCap,
  Calendar,
  Building2,
  BadgeCheck,
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  Hash,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useVerifyCertificateQRCode } from "../../../hooks/useCertificate";
import "./VerifyCertificate.css";

const VerifyCertificate = () => {
  const [searchParams] = useSearchParams();
  const params = useParams();

  // Try to get from path (splat) or fallback to query param
  const certNumber = params["*"] || searchParams.get("certificateNumber");

  const {
    data: resp,
    isLoading,
    error,
  } = useVerifyCertificateQRCode(certNumber || null);

  if (isLoading) {
    return (
      <div className="vc-root">
        <div className="vc-glow vc-glow--primary" />
        <div className="vc-glow vc-glow--secondary" />
        <div className="vc-loading-card">
          <div className="vc-loading-spinner">
            <Loader2 size={40} className="vc-spin-icon" />
          </div>
          <p className="vc-loading-label">Verifying Certificate…</p>
          <p className="vc-loading-sub">Checking against our secure records</p>
          <div className="vc-progress-bar">
            <div className="vc-progress-fill" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !resp?.success) {
    return (
      <div className="vc-root">
        <div className="vc-glow vc-glow--red" />
        <header className="vc-header">
          <div className="vc-logo-pill">
            <img
              src="/logo.png"
              alt="FPNO Logo"
              width={38}
              height={38}
              className="vc-logo-img"
            />
            <div>
              <span className="vc-logo-name">Federal Polytechnic Nekede</span>
              <span className="vc-logo-sub">Certificate Authority</span>
            </div>
          </div>
        </header>
        <div className="vc-card vc-card--error">
          <div className="vc-card-top-bar vc-card-top-bar--error" />
          <div className="vc-error-body">
            <div className="vc-error-icon-wrap">
              <XCircle size={56} strokeWidth={1.5} />
            </div>
            <h1 className="vc-error-title">Verification Failed</h1>
            <p className="vc-error-msg">
              {resp?.message ||
                "This certificate number does not exist in our official records. It may be invalid or revoked"}
            </p>
            <Link to="/" className="vc-backlink">
              <ArrowLeft size={16} />
              Return to Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data } = resp;

  const detailItems = [
    {
      icon: <GraduationCap size={16} />,
      label: "Student Name",
      value: data.studentName,
    },
    {
      icon: <Hash size={16} />,
      label: "Registration Number",
      value: data.registrationNumber,
    },
    {
      icon: <BookOpen size={16} />,
      label: "Department",
      value: data.department,
    },
    {
      icon: <ShieldCheck size={16} />,
      label: "Programme",
      value: data.program,
    },
    {
      icon: <Calendar size={16} />,
      label: "Completion Date",
      value: `${data.graduationMonth} ${data.graduationYear}`,
    },
    {
      icon: <Building2 size={16} />,
      label: "Place of IT",
      value: data.placeOfIT,
    },
    {
      icon: <Calendar size={16} />,
      label: "Issue Date",
      value: new Date(data.issueDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    },
  ];

  return (
    <div className="vc-root">
      {/* Ambient layers */}
      <div className="vc-glow vc-glow--primary" />
      <div className="vc-glow vc-glow--secondary" />
      <div className="vc-mesh-overlay" />

      <header className="vc-header">
        <div className="vc-logo-pill">
          <img
            src="/logo.png"
            alt="FPNO Logo"
            width={38}
            height={38}
            className="vc-logo-img"
          />
          <div>
            <span className="vc-logo-name">Federal Polytechnic Nekede</span>
            <span className="vc-logo-sub">
              Owerri, Imo State · SIWES Directorate
            </span>
          </div>
        </div>
      </header>

      <main className="vc-main">
        {/* Left hero column */}
        <section className="vc-hero">
          <h2 className="vc-hero-title">
            Certificate
            <br />
            <span className="vc-hero-title-accent">Verified ✓</span>
          </h2>
          <p className="vc-hero-sub">
            This document has been authenticated against the official SIWES
            records of Federal Polytechnic Nekede. Issued under the authority of
            the Industrial Placement Centre.
          </p>
          <div className="vc-cert-number-box">
            <span className="vc-cert-number-label">Certificate Number</span>
            <span className="vc-cert-number-val">{data.certificateNumber}</span>
          </div>
          <div className="vc-hero-links">
            <a
              href="https://fpno.edu.ng"
              target="_blank"
              rel="noreferrer"
              className="vc-hero-link"
            >
              <ExternalLink size={14} /> fpno.edu.ng
            </a>
            <Link to="/" className="vc-hero-link">
              <ShieldCheck size={14} /> SIWES Portal
            </Link>
          </div>
        </section>

        {/* Right card column */}
        <section className="vc-card-wrap">
          <div className="vc-card">
            <div className="vc-card-top-badge">
              <BadgeCheck size={20} />
              <span>Authentic Document</span>
            </div>

            <div className="vc-details-list">
              {detailItems.map((item) => (
                <div className="vc-detail-row" key={item.label}>
                  <div className="vc-detail-icon">{item.icon}</div>
                  <div className="vc-detail-body">
                    <span className="vc-detail-label">{item.label}</span>
                    <span className="vc-detail-value">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="vc-card-footer">
              <div className="vc-verified-stamp">
                <BadgeCheck size={14} />
                <span>
                  Electronically Verified ·{" "}
                  {new Date().toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default VerifyCertificate;
