import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./Certificate.css";
import { useSettings } from "../../../../hooks/useSettings";
import { programFullName } from "../../../../helpers/programConstants";

interface CertificateProps {
  studentName: string;
  regNumber: string;
  department: string;
  /** Programme type code, e.g. "ND" — spelled out on the certificate. */
  program: string;
  /** Programme level, e.g. "ND2" or "Year 3". */
  level: string;
  graduationYear?: number;
  graduationMonth?: string;
  graduationDate?: string;
  placeOfIT?: string;
  certificateNumber?: string;
  itStartDate?: string;
  itEndDate?: string;
  issuedAt?: string;
}

/** "1 August 2026" — or null when the date is missing / invalid. */
function longDate(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

/** A Settings asset path → an absolute URL on the API host. */
function resolveAsset(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(
    /\/api(\/v\d+)?\/?$/,
    "",
  );
  return `${apiBase}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * The clinical internship certificate (landscape A4), rendered off-screen and
 * printed to PDF by `useCertificateDownload`.
 *
 * Nothing about the issuer is hardcoded: the name, code and the one logo all
 * come from Settings, and the colours come from the
 * brand palette tokens (`--palette-*`, which don't change with dark mode, so
 * the printout is always the light brand). Everything about the student comes
 * from the certificate record. Signature lines are left blank to be signed.
 */
const Certificate = forwardRef<HTMLDivElement, CertificateProps>(
  (
    {
      studentName,
      regNumber,
      department,
      program,
      level,
      placeOfIT,
      certificateNumber,
      itStartDate,
      itEndDate,
      issuedAt,
    },
    ref,
  ) => {
    const { data: settingsResp } = useSettings();
    const settings = settingsResp?.settings;

    // The one logo — from Settings only. No logo set, no image.
    const logoUrl = resolveAsset(settings?.logo?.url);
    const issuer = settings?.name ?? "";

    const start = longDate(itStartDate);
    const end = longDate(itEndDate);
    const period = start && end ? `${start} – ${end}` : (start ?? end ?? "");
    const issued = longDate(issuedAt) ?? "";
    const programme = programFullName(program);

    const serial = [settings?.code, certificateNumber]
      .filter(Boolean)
      .join(" / ");

    // The public verification page, with the number as a query parameter —
    // numbers contain slashes (FMC/2026/…), which don't survive in a path.
    const qrValue = `${window.location.origin}/certificates/verify?certificateNumber=${encodeURIComponent(
      certificateNumber ?? "",
    )}`;

    return (
      <div className="ccert" ref={ref}>
        {/* Ribbon corners */}
        <span className="ccert__corner ccert__corner--tl" aria-hidden="true" />
        <span className="ccert__corner ccert__corner--br" aria-hidden="true" />

        <div className="ccert__frame">
          {/* ── Header: logo · title · QR ── */}
          <header className="ccert__head">
            <div className="ccert__logo">
              {logoUrl && (
                <img src={logoUrl} alt={issuer} crossOrigin="anonymous" />
              )}
            </div>

            <div className="ccert__titles">
              <h1 className="ccert__title">Clinical Internship</h1>
              <p className="ccert__subtitle">Certificate</p>
              {issuer && <p className="ccert__issuer">{issuer}</p>}
            </div>

            <div className="ccert__qr">
              <QRCodeSVG
                value={qrValue}
                size={84}
                bgColor="transparent"
                fgColor="#0f3040"
                level="M"
              />
              <span>Scan to verify</span>
            </div>
          </header>

          {/* ── Recipient, body and dates ── */}
          <div className="ccert__main">
            <p className="ccert__certify">This is to certify that</p>
            <p className="ccert__name">{studentName}</p>
            <p className="ccert__reg">Registration No. {regNumber}</p>

            <p className="ccert__body">
              a <strong>{programme}</strong> student
              {level && (
                <>
                  {" "}
                  at <strong>{level}</strong> level
                </>
              )}
              , has successfully completed the Clinical Internship Programme in
              the Department of <strong>{department}</strong>
              {issuer && (
                <>
                  {" "}
                  at <strong>{issuer}</strong>
                </>
              )}
              {placeOfIT && (
                <>
                  , placed at <strong>{placeOfIT}</strong>
                </>
              )}
              .
            </p>
            <p className="ccert__body ccert__body--soft">
              During this period, the student demonstrated professionalism,
              dedication and a commitment to quality patient care, in accordance
              with the standards and values of the profession.
            </p>

            {/* ── Period · issue date ── */}
            <div className="ccert__fields">
              <div className="ccert__field">
                <span className="ccert__field-value">{period}</span>
                <span className="ccert__field-label">Period of Internship</span>
              </div>
              <div className="ccert__field">
                <span className="ccert__field-value">{issued}</span>
                <span className="ccert__field-label">Date of Issuance</span>
              </div>
            </div>
          </div>

          {/* ── Signatures · seal ── */}
          <div className="ccert__signs">
            <div className="ccert__sign">
              <span className="ccert__sign-line" />
              <span className="ccert__sign-role">Clinical Supervisor</span>
              <span className="ccert__sign-hint">
                Name, Signature &amp; Date
              </span>
            </div>

            <div className="ccert__seal">
              <img src="/seal.jpg" alt="Certified seal" />
            </div>

            <div className="ccert__sign">
              <span className="ccert__sign-line" />
              <span className="ccert__sign-role">Head of Training</span>
              <span className="ccert__sign-hint">
                Name, Signature &amp; Stamp
              </span>
            </div>
          </div>

          {/* ── Footer: serial ── */}
          <footer className="ccert__foot">
            {serial && <span className="ccert__serial">No. {serial}</span>}
          </footer>
        </div>
      </div>
    );
  },
);

Certificate.displayName = "Certificate";

export default Certificate;
