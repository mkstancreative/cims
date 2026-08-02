import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./Certificate.css";

interface CertificateProps {
  studentName: string;
  regNumber: string;
  department: string;
  program: string;
  graduationYear?: number;
  graduationMonth?: string;
  graduationDate?: string;
  level: "ND" | "HND";
  placeOfIT?: string;
  organizationName?: string;
  serialNumber?: string;
  issueDate?: string;
  certificateNumber?: string;
  verifyUrl?: string;
  itStartDate?: string;
  itEndDate?: string;
  issuedAt?: string;
}

const Certificate = forwardRef<HTMLDivElement, CertificateProps>(
  (
    {
      studentName,
      regNumber,
      department,
      program,
      level,
      placeOfIT,
      organizationName = "NITDA (National Information Technology Development Agency)",
      serialNumber = "3845",
      issueDate,
      certificateNumber,
      verifyUrl,
      itStartDate,
      itEndDate,
      issuedAt,
    },
    ref,
  ) => {
    const displayOrg = placeOfIT || organizationName;
    const activeIssueDate = issuedAt || issueDate;
    const displayDate = activeIssueDate
      ? new Date(activeIssueDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

    const qrValue =
      verifyUrl ||
      `${window.location.origin}/certificates/verify/${encodeURIComponent(certificateNumber || serialNumber)}`;

    return (
      <div className="certificate-paper" ref={ref}>
        <div className="cert-outer-border">
          <div className="cert-inner-border">
            {/* ── HEADER ── */}
            <div className="cert-header-row">
              <div className="cert-logo-left">
                <img src="/logo.png" alt="Poly Logo" className="cert-logo" />
              </div>
              <div className="cert-header-text">
                <h1 className="cert-inst-name">
                  FEDERAL POLYTECHNIC NEKEDE, OWERRI.
                </h1>
                <p className="cert-inst-sub">
                  PMB 1036 OWERRI - IMO STATE NIGERIA
                </p>
                <h2 className="cert-centre-title">
                  INDUSTRIAL PLACEMENT CENTRE
                </h2>
                <p className="cert-siwes-tag">(SIWES DIRECTORATE)</p>
              </div>
              <div className="cert-logo-right">
                <img
                  src="/nbte.png"
                  alt="NBTE Logo"
                  className="cert-logo"
                  style={{ opacity: 0.5, filter: "grayscale(1)" }}
                />
              </div>
            </div>

            {/* ── DATE ── */}
            <div className="cert-date-row">
              <span className="cert-date-label">Issue Date: </span>
              <span
                style={{
                  borderBottom: "1px solid #000",
                  minWidth: "120px",
                  textAlign: "center",
                }}
              >
                {displayDate}
              </span>
            </div>

            <h3 className="cert-main-title">COMPLETION CERTIFICATE</h3>
            <h4 className="cert-level-sub">
              MANDATORY INDUSTRIAL TRAINING FOR {level} GRADUATES
            </h4>

            {/* ── BODY ── */}
            <div className="cert-body">
              <div className="cert-line-wrapper">
                <span className="cert-label">This is to certify that</span>
                <div className="cert-full-dotted">
                  <span className="cert-value">{studentName}</span>
                </div>
              </div>

              <div className="cert-line-wrapper">
                <span className="cert-label">with matriculation number</span>
                <div className="cert-full-dotted">
                  <span className="cert-value">{regNumber}</span>
                </div>
              </div>

              <div className="cert-line-wrapper">
                <span className="cert-label">from the Department of</span>
                <div className="cert-full-dotted">
                  <span className="cert-value">{department}</span>
                </div>
              </div>

              <p className="cert-para">
                Federal Polytechnic Nekede, Owerri, Imo State has undergone a
                mandatory Industrial Training in our organization under
              </p>

              <div className="cert-line-wrapper">
                <div className="cert-full-dotted">
                  <span className="cert-value">{displayOrg}</span>
                </div>
                <span className="cert-label">Department</span>
              </div>

              <div className="cert-line-wrapper">
                <span className="cert-label">from</span>
                <div className="cert-full-dotted">
                  <span className="cert-value">
                    {itStartDate
                      ? new Date(itStartDate).toLocaleDateString("en-GB", {
                          month: "long",
                        })
                      : "........."}
                  </span>
                </div>
                <span className="cert-label">20</span>
                <div className="cert-full-dotted" style={{ flex: 0.2 }}>
                  <span className="cert-value">
                    {itStartDate
                      ? new Date(itStartDate).getFullYear().toString().slice(-2)
                      : "...."}
                  </span>
                </div>
                <span className="cert-label">to</span>
                <div className="cert-full-dotted">
                  <span className="cert-value">
                    {itEndDate
                      ? new Date(itEndDate).toLocaleDateString("en-GB", {
                          month: "long",
                        })
                      : "........."}
                  </span>
                </div>
                <span className="cert-label">20</span>
                <div className="cert-full-dotted" style={{ flex: 0.2 }}>
                  <span className="cert-value">
                    {itEndDate
                      ? new Date(itEndDate).getFullYear().toString().slice(-2)
                      : "...."}
                  </span>
                </div>
              </div>

              <p className="cert-para">
                During the period, the student was attached to our Department
                and gained practical experiences and skills. We are pleased to
                confirm that he/she has successfully completed the mandatory
                training (minimum 4 months) and has demonstrated a good
                understanding of the required competencies.
              </p>
              <p className="cert-para">
                Please kindly give him/her the necessary cooperation and
                assistance he/she may require.
              </p>
            </div>

            {/* ── FOOTER ── */}
            <div className="cert-footer-row">
              <div className="cert-sig-block director-sig">
                <div className="sig-overlay">
                  <img
                    src="/sign.png"
                    alt="Signature"
                    className="cert-signature-img"
                  />
                  <img
                    src="/stamp.png"
                    alt="Official Stamp"
                    className="cert-stamp-img"
                  />
                </div>
                <div className="cert-sig-line" />
                <p className="cert-sig-name">Engr. Dr. Okorie N.K.</p>
                <p className="cert-sig-label">DIRECTOR, IPC/SIWES</p>
              </div>

              <div className="cert-qr-block">
                <QRCodeSVG
                  value={qrValue}
                  size={75}
                  bgColor="transparent"
                  fgColor="#1e3a8a"
                  level="M"
                />
                <p className="cert-qr-label">Scan to verify</p>
              </div>

              <div className="cert-sig-block industry-sig">
                <div className="cert-sig-dotted" />
                <p className="cert-sig-label">
                  NAME, SIGN AND STAMP OF
                  <br />
                  INDUSTRY BASED SUPERVISOR
                </p>
              </div>
            </div>

            {/* ── BOTTOM ── */}
            <div className="cert-bottom-row">
              <div className="cert-serial">
                FPN/IPC/SIWES/{" "}
                <span style={{ fontSize: "18px" }}>
                  {certificateNumber || serialNumber}
                </span>
              </div>
              <div className="cert-program">{program}</div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Certificate.displayName = "Certificate";

export default Certificate;
