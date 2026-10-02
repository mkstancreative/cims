import {
  Suspense,
  lazy,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileQuestion,
  GraduationCap,
  Layers,
  Lock,
  Mail,
  MapPin,
  Menu,
  Phone,
  ScanQrCode,
  Hash,
  Plus,
  QrCode,
  Stethoscope,
  UserCheck,
  X,
} from "lucide-react";
import { motion, MotionConfig, type Variants } from "framer-motion";
import { useSettings } from "../../hooks/useSettings";
import { useAuth } from "../../context/useAuth";
import { resolveAsset } from "../../helpers/assets";
import type { UserRole } from "../../api/types/auth";
import heroImage from "../../assets/login-hero.webp";
import "./Landing.css";

// The scanner (and its QR decoder) loads only when someone taps scan.
const QrScanModal = lazy(() => import("./QrScanModal"));

// ─── Scroll animation ─────────────────────────────────────────────────────────
// Sections reveal their cards as they scroll into view, once. A container
// staggers its children; each card rises and fades in. Reduced-motion users
// get no movement (MotionConfig below).
const EASE = [0.22, 1, 0.36, 1] as const;
const VIEW = { once: true, amount: 0.15 } as const;

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE } },
};

const popIn: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

/** Cards lift a little under the pointer. */
const HOVER = { y: -4, transition: { duration: 0.2 } };

// ─── Images ───────────────────────────────────────────────────────────────────
/**
 * A photo slot. It loads `/landing/<file>` from `public/landing/`; until that
 * file exists it shows a labelled placeholder, so dropping the image in is
 * all it takes — no code change.
 */
function ImageSlot({
  file,
  src,
  label,
  className = "",
  eager = false,
}: {
  file: string;
  /** A bundled image to use instead of `/landing/<file>`. */
  src?: string;
  label: string;
  className?: string;
  /** Above the fold — load straight away rather than on scroll. */
  eager?: boolean;
}) {
  const [missing, setMissing] = useState(false);
  return (
    <motion.div variants={zoomIn} className={`lp-img ${className}`}>
      {!missing ? (
        <img
          src={src ?? `/landing/${file}`}
          alt={label}
          loading={eager ? "eager" : "lazy"}
          onError={() => setMissing(true)}
        />
      ) : (
        <div className="lp-img__placeholder" role="img" aria-label={label}>
          <span className="lp-img__file">{file}</span>
          <span className="lp-img__label">{label}</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: "roles", label: "Who it's for" },
  { id: "how", label: "How it works" },
  { id: "features", label: "Features" },
  { id: "faq", label: "FAQ" },
];

const ROLES: {
  icon: ReactNode;
  title: string;
  body: string;
  tone?: "peach" | "mist";
}[] = [
  {
    icon: <GraduationCap size={18} />,
    title: "Students",
    body: "Register, log each day against your curriculum, sit your quiz and download your certificate.",
  },
  {
    icon: <Stethoscope size={18} />,
    title: "Clinical supervisors",
    tone: "peach",
    body: "Review logbook entries, assess students against a clear rubric and see who needs attention.",
  },
  {
    icon: <Layers size={18} />,
    title: "Coordinators",
    tone: "mist",
    body: "Create batches, link curricula, assign supervisors and quizzes, and follow every cohort.",
  },
  {
    icon: <Building2 size={18} />,
    title: "The institution",
    body: "One record of every placement, payment, grade and certificate — ready when it's needed.",
  },
];

const STEPS = [
  {
    title: "Register",
    body: "Create your account and pay the registration fee online.",
  },
  {
    title: "Get placed",
    body: "You're enrolled in a batch with its period, supervisor and curriculum.",
  },
  {
    title: "Log your days",
    body: "Record what you did against each topic; your supervisor reviews it.",
  },
  {
    title: "Get assessed",
    body: "Your supervisor submits your evaluation, criterion by criterion.",
  },
  {
    title: "Sit the quiz",
    body: "Take the timed quiz once your sitting is open and you're marked present.",
  },
  {
    title: "Get certified",
    body: "Request your certificate and download it, QR-verified.",
  },
];

const WHY = [
  {
    title: "Logbooks tied to the curriculum",
    body: "Every entry is logged against a topic and subtopic, so progress is measured against what the placement actually requires.",
  },
  {
    title: "Fair, transparent evaluations",
    body: "Supervisors score each criterion of a shared rubric, and students see exactly how their assessment was made.",
  },
  {
    title: "Quizzes that run themselves",
    body: "Sittings open per batch, attendance is taken first, and the timer and submission are handled for you.",
  },
  {
    title: "One clear final grade",
    body: "The supervisor's assessment and the quiz score combine into a single result, with the formula shown.",
  },
  {
    title: "Certificates anyone can verify",
    body: "Each certificate carries a QR code and number that confirm it against the official record.",
  },
  {
    title: "Secure, role-based access",
    body: "Students, supervisors and coordinators each see only what their role needs.",
  },
];

/** `name` is the portal's name from Settings. */
const faqFor = (name: string) => [
  {
    q: `Who can use ${name || "the portal"}?`,
    a: "Students on clinical placement, their clinical supervisors, and the coordinators who manage placements. Each signs in to a view built for their role.",
  },
  {
    q: "How do I register?",
    a: "Choose Register, fill in your details and pay the registration fee online. Once your payment is confirmed and your registration is reviewed, you're placed in a batch.",
  },
  {
    q: "How is my final grade worked out?",
    a: "Your supervisor's assessment and your quiz score are combined into one final grade. Your evaluation page shows each part and how they add up.",
  },
  {
    q: "When can I take the quiz?",
    a: "After your supervisor has evaluated you, once your batch's sitting is open and you've been marked present. The quiz page tells you what's still outstanding.",
  },
  {
    q: "How do I get my certificate?",
    a: "When your placement is complete and graded, request your certificate in the app. Once it's approved you can download it as a PDF.",
  },
  {
    q: "Can someone check that a certificate is genuine?",
    a: "Yes. Scan the QR code on the certificate, or enter its number in the verification box on this page.",
  },
];

const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  coordinator: "/admin/dashboard",
  supervisor: "/supervisor/dashboard",
  student: "/student/dashboard",
};

/** "SIWES IT Portal" → "SP" (first and last word) — stands in for a logo. */
function initials(name: string): string {
  const words = name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
  const picked = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return picked.map((w) => w[0].toUpperCase()).join("");
}

/** The logo and name from Settings. A missing or broken logo shows the
 *  name's initials instead — nothing is bundled. */
function Brand({
  name,
  logoUrl,
  onLogoError,
}: {
  name: string;
  logoUrl: string | null;
  onLogoError: () => void;
}) {
  return (
    <>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className="lp-brand__logo"
          onError={onLogoError}
        />
      ) : (
        <span
          className="lp-brand__logo lp-brand__logo--initials"
          aria-hidden="true"
        >
          {initials(name)}
        </span>
      )}
      <span className="lp-brand__name">{name}</span>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: settingsResp } = useSettings();
  const settings = settingsResp?.settings;

  // Everything about the institution comes from Settings.
  const name = settings?.name ?? "";
  const [logoFailed, setLogoFailed] = useState(false);
  const logoUrl = logoFailed ? null : resolveAsset(settings?.logo?.url);
  const faq = faqFor(name);

  // The browser tab carries the portal's name too.
  useEffect(() => {
    if (!name) return;
    const previous = document.title;
    document.title = name;
    return () => {
      document.title = previous;
    };
  }, [name]);

  const [menuOpen, setMenuOpen] = useState(false);

  // Once the page moves, the top bar turns to light frosted glass.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [openWhy, setOpenWhy] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [certNumber, setCertNumber] = useState("");
  const [scanning, setScanning] = useState(false);

  const dashboard = user ? (ROLE_HOME[user.role] ?? "/login") : null;

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const openVerification = (number: string) =>
    navigate(
      `/certificates/verify?certificateNumber=${encodeURIComponent(number)}`,
    );

  const verify = (e: FormEvent) => {
    e.preventDefault();
    const n = certNumber.trim();
    if (n) openVerification(n);
  };

  // Signed in already? Offer the way back in instead of login / register.
  const authButtons = (variant: "nav" | "hero" | "cta") =>
    dashboard ? (
      <Link
        to={dashboard}
        className={`lp-btn lp-btn--primary lp-btn--${variant}`}
      >
        Go to dashboard <ArrowRight size={16} />
      </Link>
    ) : (
      <>
        <Link to="/login" className={`lp-btn lp-btn--ghost lp-btn--${variant}`}>
          Log in
        </Link>
        <Link
          to="/register"
          className={`lp-btn lp-btn--primary lp-btn--${variant}`}
        >
          Register <ArrowRight size={16} />
        </Link>
      </>
    );

  return (
    <MotionConfig reducedMotion="user">
      <div className="lp">
        {/* ── Nav ── */}
        <header className={`lp-nav${scrolled ? " is-scrolled" : ""}`}>
          <div className="lp-container lp-nav__inner">
            <button
              type="button"
              className="lp-brand"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <Brand
                name={name}
                logoUrl={logoUrl}
                onLogoError={() => setLogoFailed(true)}
              />
            </button>

            <nav className={`lp-nav__links${menuOpen ? " is-open" : ""}`}>
              {NAV.map((n) => (
                <button key={n.id} type="button" onClick={() => scrollTo(n.id)}>
                  {n.label}
                </button>
              ))}
              <div className="lp-nav__auth lp-nav__auth--mobile">
                {authButtons("nav")}
              </div>
            </nav>

            <div className="lp-nav__auth">{authButtons("nav")}</div>

            <button
              type="button"
              className="lp-nav__toggle"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        <main>
          {/* ── Hero ── */}
          <section className="lp-hero-section">
            <div className="lp-hero">
              <div className="lp-hero__copy">
                <h1>
                  Every clinical placement, managed in{" "}
                  <em>one secure platform</em>
                </h1>
                <p>
                  {name
                    ? `${name} places students in clinical batches, tracks daily logbooks against the curriculum, runs supervisor evaluations and quizzes, and issues certificates anyone can verify.`
                    : "Place students in clinical batches, track daily logbooks against the curriculum, run supervisor evaluations and quizzes, and issue certificates anyone can verify."}
                </p>
                <div className="lp-hero__cta">{authButtons("hero")}</div>

                <div className="lp-hero__roles">
                  <div className="lp-avatars" aria-hidden="true">
                    <span>
                      <GraduationCap size={14} />
                    </span>
                    <span>
                      <Stethoscope size={14} />
                    </span>
                    <span>
                      <Layers size={14} />
                    </span>
                  </div>
                  <span>
                    Students, supervisors and coordinators —{" "}
                    <strong>one shared record</strong>
                  </span>
                </div>
              </div>

              <div className="lp-hero__visual">
                <ImageSlot
                  file="hero.jpg"
                  src={heroImage}
                  eager
                  label="Nurse in scrubs writing up her logbook"
                  className="lp-hero__photo"
                />

                {/* Illustrative UI cards floating over the photo */}
                <div className="lp-float lp-float--top">
                  <span className="lp-float__icon lp-float__icon--ok">
                    <CheckCircle2 size={16} />
                  </span>
                  <div>
                    <strong>Logbook entry approved</strong>
                    <span>Reviewed by your supervisor</span>
                  </div>
                </div>

                <div className="lp-float lp-float--bottom">
                  <span className="lp-float__icon">
                    <QrCode size={16} />
                  </span>
                  <div>
                    <strong>Certificate issued</strong>
                    <span>Verifiable by QR code</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Roles ── */}
          <section id="roles" className="lp-section">
            <div className="lp-container">
              <motion.header
                variants={rise}
                initial="hidden"
                whileInView="show"
                viewport={VIEW}
                className="lp-head"
              >
                <span className="lp-eyebrow">Who it's for</span>
                <h2>Built for everyone in the placement</h2>
                <p>
                  Each role gets its own workspace, all working from the same
                  records — so nothing is lost between the ward and the office.
                </p>
              </motion.header>

              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={VIEW}
                className="lp-roles"
              >
                <div className="lp-roles__col">
                  {ROLES.slice(0, 2).map((r) => (
                    <motion.article
                      variants={rise}
                      whileHover={HOVER}
                      key={r.title}
                      className={`lp-card lp-role${r.tone ? ` lp-card--${r.tone}` : ""}`}
                    >
                      <span className="lp-icon">{r.icon}</span>
                      <h3>{r.title}</h3>
                      <p>{r.body}</p>
                    </motion.article>
                  ))}
                </div>
                <ImageSlot
                  file="roles.jpg"
                  label="Smiling clinician in a white coat with a stethoscope"
                  className="lp-roles__photo"
                />
                <div className="lp-roles__col">
                  {ROLES.slice(2).map((r) => (
                    <motion.article
                      variants={rise}
                      whileHover={HOVER}
                      key={r.title}
                      className={`lp-card lp-role${r.tone ? ` lp-card--${r.tone}` : ""}`}
                    >
                      <span className="lp-icon">{r.icon}</span>
                      <h3>{r.title}</h3>
                      <p>{r.body}</p>
                    </motion.article>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* ── How it works ── */}
          <section id="how" className="lp-section lp-section--tint">
            <div className="lp-container">
              <motion.header
                variants={rise}
                initial="hidden"
                whileInView="show"
                viewport={VIEW}
                className="lp-head"
              >
                <span className="lp-eyebrow">How it works</span>
                <h2>From registration to certificate</h2>
                <p>
                  Six steps, each one tracked, so you always know what's next.
                </p>
              </motion.header>

              <motion.ol
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={VIEW}
                className="lp-steps"
              >
                {STEPS.map((s, i) => (
                  <motion.li
                    variants={rise}
                    whileHover={HOVER}
                    key={s.title}
                    className={`lp-card lp-step${i % 2 ? " lp-card--mist" : ""}`}
                  >
                    <span className="lp-step__num">{i + 1}</span>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </motion.li>
                ))}
              </motion.ol>
            </div>
          </section>

          {/* ── Why (accordion + photo) ── */}
          <section className="lp-section">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={VIEW}
              className="lp-container lp-why"
            >
              <div>
                <motion.header
                  variants={rise}
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEW}
                  className="lp-head lp-head--left"
                >
                  <span className="lp-eyebrow">Why {name || "us"}</span>
                  <h2>Placements that are fair, clear and on record</h2>
                </motion.header>

                <div className="lp-accordion">
                  {WHY.map((w, i) => {
                    const open = openWhy === i;
                    return (
                      <motion.div
                        variants={rise}
                        key={w.title}
                        className={`lp-acc${open ? " is-open" : ""}`}
                      >
                        <button
                          type="button"
                          className="lp-acc__head"
                          aria-expanded={open}
                          onClick={() => setOpenWhy(open ? -1 : i)}
                        >
                          {w.title}
                          <Plus size={18} className="lp-acc__icon" />
                        </button>
                        <div className="lp-acc__body">
                          <p>{w.body}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <ImageSlot
                file="why.jpg"
                label="Hands typing on a laptop beside a stethoscope"
                className="lp-why__photo"
              />
            </motion.div>
          </section>

          {/* ── Features (bento) ── */}
          <section id="features" className="lp-section lp-section--tint">
            <div className="lp-container">
              <motion.header
                variants={rise}
                initial="hidden"
                whileInView="show"
                viewport={VIEW}
                className="lp-head"
              >
                <span className="lp-eyebrow">Features</span>
                <h2>Everything a placement needs, in one place</h2>
              </motion.header>

              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={VIEW}
                className="lp-bento"
              >
                <motion.article
                  variants={rise}
                  whileHover={HOVER}
                  className="lp-card lp-bento__logbook"
                >
                  <span className="lp-icon">
                    <BookOpen size={18} />
                  </span>
                  <h3>Daily logbooks</h3>
                  <p>
                    Log each day against the curriculum's topics. Supervisors
                    approve or send entries back, and progress updates as you
                    go.
                  </p>
                  <ImageSlot
                    file="logbook.jpg"
                    label="Clinician reviewing an entry on a tablet"
                    className="lp-bento__photo"
                  />
                </motion.article>

                <motion.article
                  variants={rise}
                  whileHover={HOVER}
                  className="lp-card lp-bento__grade"
                >
                  <span className="lp-icon">
                    <ClipboardCheck size={18} />
                  </span>
                  <h3>One clear final grade</h3>
                  <div className="lp-formula" aria-hidden="true">
                    <span>
                      <UserCheck size={15} /> Supervisor assessment
                    </span>
                    <Plus size={14} />
                    <span>
                      <FileQuestion size={15} /> Quiz score
                    </span>
                    <ArrowRight size={14} />
                    <strong>Final grade</strong>
                  </div>
                  <p>Both parts and the formula are shown to the student.</p>
                </motion.article>

                <motion.article
                  variants={rise}
                  whileHover={HOVER}
                  className="lp-card lp-card--peach lp-bento__quiz"
                >
                  <span className="lp-icon">
                    <FileQuestion size={18} />
                  </span>
                  <h3>Timed quiz sittings</h3>
                  <p>
                    Opened per batch, with attendance first and the clock and
                    submission handled automatically.
                  </p>
                </motion.article>

                <motion.article
                  variants={rise}
                  whileHover={HOVER}
                  className="lp-card lp-card--mist lp-bento__pay"
                >
                  <span className="lp-icon">
                    <CreditCard size={18} />
                  </span>
                  <h3>Online payments</h3>
                  <p>
                    Pay registration fees online and keep every receipt in your
                    account.
                  </p>
                </motion.article>

                {/* Real: checks a certificate against the official record */}
                <motion.article
                  variants={rise}
                  whileHover={HOVER}
                  id="verify"
                  className="lp-card lp-bento__verify"
                >
                  <span className="lp-icon">
                    <Award size={18} />
                  </span>
                  <h3>Verify a certificate</h3>
                  <p>
                    Enter the number printed on a certificate to confirm it's
                    genuine.
                  </p>
                  <form className="lp-verify" onSubmit={verify}>
                    <div className="lp-verify__field">
                      <Hash
                        size={16}
                        className="lp-verify__lead"
                        aria-hidden="true"
                      />
                      <input
                        value={certNumber}
                        onChange={(e) => setCertNumber(e.target.value)}
                        placeholder="Certificate number"
                        aria-label="Certificate number"
                        autoCapitalize="characters"
                        autoCorrect="off"
                        spellCheck={false}
                        enterKeyHint="go"
                      />
                      <button
                        type="button"
                        className="lp-verify__scan"
                        onClick={() => setScanning(true)}
                        aria-label="Scan the certificate's QR code"
                        title="Scan QR code"
                      >
                        <ScanQrCode size={18} />
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="lp-verify__submit"
                      disabled={!certNumber.trim()}
                    >
                      Verify <ArrowUpRight size={15} />
                    </button>
                  </form>
                  <p className="lp-verify__or">
                    Or tap <ScanQrCode size={13} /> to scan the QR code on the
                    certificate.
                  </p>
                </motion.article>
              </motion.div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section id="faq" className="lp-section">
            <div className="lp-container lp-faq">
              <motion.header
                variants={rise}
                initial="hidden"
                whileInView="show"
                viewport={VIEW}
                className="lp-head"
              >
                <span className="lp-eyebrow">FAQ</span>
                <h2>Questions, answered</h2>
              </motion.header>
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={VIEW}
                className="lp-accordion"
              >
                {faq.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <motion.div
                      variants={rise}
                      key={f.q}
                      className={`lp-acc${open ? " is-open" : ""}`}
                    >
                      <button
                        type="button"
                        className="lp-acc__head"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : i)}
                      >
                        {f.q}
                        <Plus size={18} className="lp-acc__icon" />
                      </button>
                      <div className="lp-acc__body">
                        <p>{f.a}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="lp-container">
            <motion.div
              variants={popIn}
              initial="hidden"
              whileInView="show"
              viewport={VIEW}
              className="lp-cta"
            >
              <span className="lp-chip">
                <Lock size={14} /> Secure sign-in for every role
              </span>
              <h2>
                Your clinical placement <em>starts here</em>
              </h2>
              <p>
                New student? Register to begin. Already registered? Log in to
                pick up where you left off.
              </p>
              <div className="lp-hero__cta lp-cta__buttons">
                {authButtons("cta")}
              </div>
            </motion.div>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer className="lp-footer">
          <div className="lp-container lp-footer__inner">
            <div className="lp-footer__brand">
              <div className="lp-brand">
                <Brand
                  name={name}
                  logoUrl={logoUrl}
                  onLogoError={() => setLogoFailed(true)}
                />
              </div>
              {settings?.code && <p>{settings.code}</p>}
            </div>

            <ul className="lp-footer__contact">
              {settings?.address && (
                <li>
                  <MapPin size={15} /> {settings.address}
                </li>
              )}
              {settings?.phone && (
                <li>
                  <Phone size={15} />{" "}
                  <a href={`tel:${settings.phone}`}>{settings.phone}</a>
                </li>
              )}
              {settings?.email && (
                <li>
                  <Mail size={15} />{" "}
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </li>
              )}
            </ul>

            <div className="lp-footer__links">
              <Link to="/login">Log in</Link>
              <Link to="/register">Register</Link>
              <button type="button" onClick={() => scrollTo("verify")}>
                Verify a certificate
              </button>
            </div>
          </div>
          <div className="lp-container lp-footer__base">
            © {new Date().getFullYear()} {name}. All rights reserved.
          </div>
        </footer>

        {scanning && (
          <Suspense fallback={null}>
            <QrScanModal
              onClose={() => setScanning(false)}
              onResult={(number) => {
                setScanning(false);
                setCertNumber(number);
                openVerification(number);
              }}
            />
          </Suspense>
        )}
      </div>
    </MotionConfig>
  );
}
