import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../Login/Login.css";
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

  const appName = import.meta.env.VITE_APP_NAME;

  const sectionTitleStyle: React.CSSProperties = {
    gridColumn: "1 / -1",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: "#2dd4bf",
    marginTop: 8,
    marginBottom: 2,
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #0d1117 0%, #111827 50%, #0d1f2d 100%)",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        className="login-card-wrapper"
        style={{ width: "100%", maxWidth: 860 }}
      >
        <div className="login-card" style={{ maxWidth: "860px" }}>
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
            <span style={{ fontWeight: 700, fontSize: 16 }}>{appName}</span>
          </div>

          <div className="login-card-title">Create an Account</div>
          <div className="login-card-sub">
            Student Registration &amp; Enrollment Portal
          </div>

          {error && (
            <div className="login-error" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px 24px",
                marginBottom: 24,
              }}
            >
              {/* ── Account ── */}
              <div style={sectionTitleStyle}>Personal Details</div>

              <div className="form-group">
                <label className="form-label">First Name</label>
                <div className="form-input-wrap">
                  <input
                    name="firstName"
                    type="text"
                    className="form-input"
                    placeholder="Mary"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <div className="form-input-wrap">
                  <input
                    name="lastName"
                    type="text"
                    className="form-input"
                    placeholder="Johnson"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email address</label>
                <div className="form-input-wrap">
                  <input
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="you@university.edu"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="form-input-wrap">
                  <input
                    name="phone"
                    type="tel"
                    className="form-input"
                    placeholder="08098765432"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <div className="form-input-wrap">
                  <input
                    name="dateOfBirth"
                    type="date"
                    className="form-input"
                    max={new Date().toISOString().split("T")[0]}
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <div className="form-input-wrap">
                  <select
                    name="gender"
                    className="form-input"
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
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">State of Origin</label>
                <div className="form-input-wrap">
                  <select
                    name="stateOfOrigin"
                    className="form-input"
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
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nationality</label>
                <div className="form-input-wrap">
                  <input
                    name="nationality"
                    type="text"
                    className="form-input"
                    placeholder="Nigeria"
                    value={form.nationality}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Residential Address</label>
                <div className="form-input-wrap">
                  <input
                    name="address"
                    type="text"
                    className="form-input"
                    placeholder="123 Main Street, Owerri, Imo State"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* ── Academic ── */}
              <div style={sectionTitleStyle}>Academic Details</div>

              <div className="form-group">
                <label className="form-label">Institution</label>
                <div className="form-input-wrap">
                  <select
                    name="institutionId"
                    className="form-input"
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
                </div>
              </div>

              {/* The applicant is about to be charged this, so the amount is
                  spelled out before they hit pay. */}
              <div className="form-group">
                <label className="form-label">Placement Duration</label>
                <div className="form-input-wrap">
                  <select
                    name="durationId"
                    className="form-input"
                    value={form.durationId}
                    onChange={handleChange}
                    required
                    disabled={loadingDurations}
                  >
                    <option value="">
                      {loadingDurations
                        ? "Loading durations…"
                        : "Select placement Duration"}
                    </option>
                    {durations.map((d) => (
                      <option key={d._id} value={d._id}>
                        {durationLabel(d)} — {formatPrice(d.price)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedDuration && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    padding: "12px 16px",
                    marginTop: 4,
                    marginBottom: 4,
                    borderRadius: 10,
                    border: "1px solid rgba(45, 212, 191, 0.35)",
                    background: "rgba(45, 212, 191, 0.08)",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#cbd5e1" }}>
                    You are registering for{" "}
                    <strong style={{ color: "#fff" }}>
                      {durationLabel(selectedDuration)}
                    </strong>
                    . This is what you will be charged now.
                  </span>
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#2dd4bf",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatPrice(selectedDuration.price)}
                  </span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Registration Number</label>
                <div className="form-input-wrap">
                  <input
                    name="registrationNumber"
                    type="text"
                    className="form-input"
                    placeholder="2024/ENG/045"
                    value={form.registrationNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <div className="form-input-wrap">
                  <input
                    name="departmentName"
                    type="text"
                    className="form-input"
                    placeholder="Electrical Engineering"
                    value={form.departmentName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Program Type</label>
                <div className="form-input-wrap">
                  <select
                    name="programType"
                    className="form-input"
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
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Program Level</label>
                <div className="form-input-wrap">
                  <select
                    name="programLevel"
                    className="form-input"
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
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Professional Reg. Number{" "}
                  <span style={{ color: "#6b7280", fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <div className="form-input-wrap">
                  <input
                    name="professionalRegNumber"
                    type="text"
                    className="form-input"
                    placeholder="e.g. COREN/2024/1234"
                    value={form.professionalRegNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* ── Next of Kin ── */}
              <div style={sectionTitleStyle}>Next of Kin</div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="form-input-wrap">
                  <input
                    name="nokName"
                    type="text"
                    className="form-input"
                    placeholder="Mr. Johnson Senior"
                    value={form.nokName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Relationship</label>
                <div className="form-input-wrap">
                  <select
                    name="nokRelationship"
                    className="form-input"
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
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="form-input-wrap">
                  <input
                    name="nokPhone"
                    type="tel"
                    className="form-input"
                    placeholder="08012345678"
                    value={form.nokPhone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <div className="form-input-wrap">
                  <input
                    name="nokAddress"
                    type="text"
                    className="form-input"
                    placeholder="123 Main Street, Owerri"
                    value={form.nokAddress}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* ── Security ── */}
              <div style={sectionTitleStyle}>Security</div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="form-input-wrap">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Minimum 8 characters"
                    style={{ paddingRight: 40 }}
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                  <span
                    className="input-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="form-input-wrap">
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={isPending}
              style={{ width: "100%", display: "block", marginTop: "8px" }}
            >
              {isPending ? "Submitting…" : "Register & Proceed to Payment"}
            </button>

            <div style={{ marginTop: 20, textAlign: "center", fontSize: 14 }}>
              <span style={{ color: "var(--color-text-muted)" }}>
                Already have an account?{" "}
              </span>
              <Link
                to="/"
                style={{
                  color: "var(--color-accent)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
