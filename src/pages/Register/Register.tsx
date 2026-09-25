import {
  useState,
  type FormEvent,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  CreditCard,
  Eye,
  EyeOff,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  ShieldCheck,
  Stethoscope,
  User,
  UserPlus,
} from "lucide-react";
import AuthBrandPanel, {
  type AuthFeature,
} from "../../components/auth/AuthBrandPanel";
import "./RegisterPage.css";
import { useRegisterStudent } from "../../hooks/useRegistrations";
import { usePublicInstitutions } from "../../hooks/useInstitutions";
import { usePublicDurations } from "../../hooks/useDurations";
import { useStates } from "../../hooks/useLocation";
import { durationLabel, formatPrice } from "../../helpers/duration";
import {
  isRegistrationPaid,
  type RegisterPayload,
} from "../../api/types/registration";
import {
  PROGRAM_TYPES,
  PROGRAM_LEVELS_BY_TYPE,
} from "../../helpers/programConstants";

const GENDERS = ["male", "female"];

const NOK_RELATIONSHIPS = [
  "Father",
  "Mother",
  "Spouse",
  "Brother",
  "Sister",
  "Son",
  "Daughter",
  "Guardian",
  "Uncle",
  "Aunt",
  "Cousin",
  "Friend",
  "Other",
];

const features: AuthFeature[] = [
  {
    icon: <UserPlus size={22} />,
    tone: "navy",
    title: "Fill in your details",
    desc: "Personal, academic, and next-of-kin information.",
  },
  {
    icon: <CreditCard size={22} />,
    tone: "clay",
    title: "Pay your placement fee",
    desc: "Secure online payment through Credo.",
  },
  {
    icon: <BadgeCheck size={22} />,
    tone: "slate",
    title: "Get enrolled",
    desc: "Your coordinator reviews and confirms your place.",
  },
];

function Field({
  id,
  label,
  optional,
  full,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`auth-field${full ? " reg-full" : ""}`}>
      <label htmlFor={id} className="auth-label">
        {label}
        {optional && <span className="reg-optional"> (optional)</span>}
      </label>
      {children}
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="reg-section">
      <legend className="reg-section__title">
        {icon}
        {title}
      </legend>
      <div className="reg-grid">{children}</div>
    </fieldset>
  );
}

type FormState = Omit<RegisterPayload, "nextOfKin"> & {
  confirmPassword: string;
  nokName: string;
  nokRelationship: string;
  nokPhone: string;
  nokAddress: string;
};

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  registrationNumber: "",
  departmentName: "",
  programType: "ND",
  programLevel: "",
  institutionId: "",
  durationId: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  stateOfOrigin: "",
  nationality: "Nigeria",
  professionalRegNumber: "",
  nokName: "",
  nokRelationship: "",
  nokPhone: "",
  nokAddress: "",
};

const Register = () => {
  const navigate = useNavigate();
  const { mutate: register, isPending } = useRegisterStudent();
  const { data: institutionsResp, isLoading: loadingInstitutions } =
    usePublicInstitutions();
  const { data: states, isLoading: loadingStates } = useStates();
  const { data: durationsResp, isLoading: loadingDurations } =
    usePublicDurations();

  const [form, setForm] = useState<FormState>(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const institutions = institutionsResp?.data ?? [];
  const durations = durationsResp?.data ?? [];
  const selectedDuration =
    durations.find((d) => d._id === form.durationId) ?? null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Levels depend on the program type, so a type change resets the level.
      ...(name === "programType" ? { programLevel: "" } : {}),
    }));
    if (error) setError("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!form.institutionId) {
      setError("Please select your institution.");
      return;
    }
    if (!form.durationId) {
      setError("Please select your placement period.");
      return;
    }

    const payload: RegisterPayload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      registrationNumber: form.registrationNumber,
      departmentName: form.departmentName,
      programType: form.programType,
      programLevel: form.programLevel,
      institutionId: form.institutionId,
      durationId: form.durationId,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      address: form.address,
      stateOfOrigin: form.stateOfOrigin,
      nationality: form.nationality,
      nextOfKin: {
        name: form.nokName,
        relationship: form.nokRelationship,
        phone: form.nokPhone,
        address: form.nokAddress,
      },
    };

    if (form.professionalRegNumber?.trim()) {
      payload.professionalRegNumber = form.professionalRegNumber.trim();
    }

    register(payload, {
      onSuccess: (res) => {
        // Already settled — there is nothing to pay for, so send them to sign in.
        if (isRegistrationPaid(res)) {
          toast.success(
            "This registration is already paid. Please sign in to continue.",
          );
          navigate("/", { replace: true });
          return;
        }

        // 200 means we resumed an existing unpaid attempt rather than creating
        // a new one; the link below belongs to that same registration.
        if (res.resumed) {
          toast.info("Resuming your existing registration payment…");
        }

        // Redirect the browser to Credo so the applicant can pay.
        if (res?.data?.authorizationUrl) {
          window.location.href = res.data.authorizationUrl;
          return;
        }

        setError(
          "Your registration was saved but no payment link was returned. Please sign in to complete payment.",
        );
      },
    });
  };

  const input = "auth-input auth-input--plain";
  const select = "auth-input auth-input--plain reg-select";

  return (
    <div className="auth-page auth-page--register">
      <AuthBrandPanel
        headline="Join the Program."
        accent="Enrol in Minutes."
        lead="Create your student account, choose your placement period, and pay securely online to get enrolled."
        features={features}
      />

      <section className="auth-form-side">
        <div className="auth-card reg-card">
          <div className="auth-card__blob" aria-hidden="true" />

          <div className="auth-eyebrow">Get started</div>
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-sub reg-sub">
            Student Registration &amp; Enrollment Portal. Fill in your details
            to register for your clinical placement.
          </p>

          {error && (
            <div className="reg-error" role="alert">
              <CircleAlert size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <Section icon={<User size={16} />} title="Personal Details">
              <Field id="firstName" label="First Name">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className={input}
                  placeholder="Mary"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                />
              </Field>
              <Field id="lastName" label="Last Name">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className={input}
                  placeholder="Johnson"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                />
              </Field>
              <Field id="email" label="Email Address">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={input}
                  placeholder="you@institution.edu"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </Field>
              <Field id="phone" label="Phone Number">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={input}
                  placeholder="08098765432"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  autoComplete="tel"
                />
              </Field>
              <Field id="dateOfBirth" label="Date of Birth">
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  className={input}
                  max={new Date().toISOString().split("T")[0]}
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field id="gender" label="Gender">
                <select
                  id="gender"
                  name="gender"
                  className={`${select} reg-select--capitalize`}
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="stateOfOrigin" label="State of Origin">
                <select
                  id="stateOfOrigin"
                  name="stateOfOrigin"
                  className={select}
                  value={form.stateOfOrigin}
                  onChange={handleChange}
                  required
                  disabled={loadingStates}
                >
                  <option value="">
                    {loadingStates ? "Loading states…" : "Select state"}
                  </option>
                  {(states ?? []).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="nationality" label="Nationality">
                <input
                  id="nationality"
                  name="nationality"
                  type="text"
                  className={input}
                  placeholder="Nigeria"
                  value={form.nationality}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field id="address" label="Residential Address" full>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className={input}
                  placeholder="123 Main Street, Owerri, Imo State"
                  value={form.address}
                  onChange={handleChange}
                  required
                  autoComplete="street-address"
                />
              </Field>
            </Section>

            <Section icon={<GraduationCap size={16} />} title="Academic Details">
              <Field id="institutionId" label="Institution">
                <select
                  id="institutionId"
                  name="institutionId"
                  className={select}
                  value={form.institutionId}
                  onChange={handleChange}
                  required
                  disabled={loadingInstitutions}
                >
                  <option value="">
                    {loadingInstitutions
                      ? "Loading institutions…"
                      : "Select institution"}
                  </option>
                  {institutions.map((inst) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.name} ({inst.code})
                    </option>
                  ))}
                </select>
              </Field>

              {/* The applicant is about to be charged this, so the amount is
                  spelled out before they hit pay. */}
              <Field id="durationId" label="Placement Duration">
                <select
                  id="durationId"
                  name="durationId"
                  className={select}
                  value={form.durationId}
                  onChange={handleChange}
                  required
                  disabled={loadingDurations}
                >
                  <option value="">
                    {loadingDurations
                      ? "Loading durations…"
                      : "Select placement duration"}
                  </option>
                  {durations.map((d) => (
                    <option key={d._id} value={d._id}>
                      {durationLabel(d)} — {formatPrice(d.price)}
                    </option>
                  ))}
                </select>
              </Field>

              {selectedDuration && (
                <div className="reg-price reg-full">
                  <span>
                    You are registering for{" "}
                    <strong>{durationLabel(selectedDuration)}</strong>. This is
                    what you will be charged now.
                  </span>
                  <span className="reg-price__amount">
                    {formatPrice(selectedDuration.price)}
                  </span>
                </div>
              )}

              <Field id="registrationNumber" label="Registration Number">
                <input
                  id="registrationNumber"
                  name="registrationNumber"
                  type="text"
                  className={input}
                  placeholder="2024/ENG/045"
                  value={form.registrationNumber}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field id="departmentName" label="Department">
                <input
                  id="departmentName"
                  name="departmentName"
                  type="text"
                  className={input}
                  placeholder="Electrical Engineering"
                  value={form.departmentName}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field id="programType" label="Program Type">
                <select
                  id="programType"
                  name="programType"
                  className={select}
                  value={form.programType}
                  onChange={handleChange}
                  required
                >
                  {PROGRAM_TYPES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="programLevel" label="Program Level">
                <select
                  id="programLevel"
                  name="programLevel"
                  className={select}
                  value={form.programLevel}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select level</option>
                  {(PROGRAM_LEVELS_BY_TYPE[form.programType] ?? []).map(
                    (p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ),
                  )}
                </select>
              </Field>
              <Field
                id="professionalRegNumber"
                label="Professional Reg. Number"
                optional
              >
                <input
                  id="professionalRegNumber"
                  name="professionalRegNumber"
                  type="text"
                  className={input}
                  placeholder="e.g. COREN/2024/1234"
                  value={form.professionalRegNumber}
                  onChange={handleChange}
                />
              </Field>
            </Section>

            <Section icon={<HeartHandshake size={16} />} title="Next of Kin">
              <Field id="nokName" label="Full Name">
                <input
                  id="nokName"
                  name="nokName"
                  type="text"
                  className={input}
                  placeholder="Mr. Johnson Senior"
                  value={form.nokName}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field id="nokRelationship" label="Relationship">
                <select
                  id="nokRelationship"
                  name="nokRelationship"
                  className={select}
                  value={form.nokRelationship}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select relationship</option>
                  {NOK_RELATIONSHIPS.map((rel) => (
                    <option key={rel} value={rel}>
                      {rel}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="nokPhone" label="Phone Number">
                <input
                  id="nokPhone"
                  name="nokPhone"
                  type="tel"
                  className={input}
                  placeholder="08012345678"
                  value={form.nokPhone}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field id="nokAddress" label="Address">
                <input
                  id="nokAddress"
                  name="nokAddress"
                  type="text"
                  className={input}
                  placeholder="123 Main Street, Owerri"
                  value={form.nokAddress}
                  onChange={handleChange}
                  required
                />
              </Field>
            </Section>

            <Section icon={<KeyRound size={16} />} title="Security">
              <Field id="password" label="Password">
                <div className="auth-input-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`${input} auth-input--with-toggle`}
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    autoComplete="new-password"
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
              </Field>
              <Field id="confirmPassword" label="Confirm Password">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className={input}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </Field>
            </Section>

            <button type="submit" className="auth-submit" disabled={isPending}>
              {isPending ? "Submitting…" : "Register & Proceed to Payment"}
              {!isPending && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-register">
            Already have an account?{" "}
            <Link to="/" className="auth-link">
              Sign in
            </Link>
          </p>

          <div className="auth-card__footer">
            <span className="auth-secure">
              <ShieldCheck size={15} /> Secure &amp; Confidential · Payments by
              Credo
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
    </div>
  );
};

export default Register;
