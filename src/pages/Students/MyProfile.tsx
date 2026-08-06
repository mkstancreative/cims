import { useState, useRef, type FormEvent } from "react";
import {
  User,
  Camera,
  Pencil,
  CalendarDays,
  UserCheck,
  ShieldCheck,
  IdCard,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useGetMe } from "../../hooks/useAuth";
import {
  useUpdateStudentProfile,
  useUploadPassport,
} from "../../hooks/useITStudents";
import CustomModal from "../../components/ui/CustomModal/CustomModal";
import type { UpdateStudentProfilePayload } from "../../api/types/itstudent";
import "./MyProfile.css";
import { formatDate } from "../../helpers/utilities";
import AddButton from "../../components/ui/AddButton/AddButton";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode | string | null;
}) {
  return (
    <div className="mp-info-row">
      <span className="mp-info-key">{label}</span>
      <span className="mp-info-val">{value || "—"}</span>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mp-section-block">
      <div className="mp-section-header">
        {icon}
        <span className="mp-section-title">{title}</span>
      </div>
      {children}
    </div>
  );
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditProfileModal({
  isOpen,
  onClose,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  initial: UpdateStudentProfilePayload;
}) {
  const [phone, setPhone] = useState(initial.phone);
  const [guarantor, setGuarantor] = useState({ ...initial.guarantor });
  const { mutate: updateProfile, isPending } = useUpdateStudentProfile();

  const setG = (k: keyof typeof guarantor, v: string) =>
    setGuarantor((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateProfile({ phone, guarantor }, { onSuccess: onClose });
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      subtitle="Update your contact details and next of kin information"
      icon={<Pencil size={16} />}
      size="default"
    >
      <form className="mp-edit-form" onSubmit={handleSubmit}>
        {/* Phone */}
        <div className="mp-edit-section">
          <div className="mp-edit-section-label">Contact</div>
          <div className="form-group">
            <label className="modal-label">
              Phone Number <span className="req">*</span>
            </label>
            <input
              required
              type="tel"
              className="modal-input"
              placeholder="e.g. 08012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Next of Kin */}
        <div className="mp-edit-section">
          <div className="mp-edit-section-label">Next of Kin</div>
          <div className="mp-edit-row-2">
            <div className="form-group">
              <label className="modal-label">
                Full Name <span className="req">*</span>
              </label>
              <input
                required
                type="text"
                className="modal-input"
                placeholder="e.g. Mr. Okonkwo Senior"
                value={guarantor.name}
                onChange={(e) => setG("name", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="modal-label">
                Relationship <span className="req">*</span>
              </label>
              <input
                required
                type="text"
                className="modal-input"
                placeholder="e.g. Father"
                value={guarantor.relationship}
                onChange={(e) => setG("relationship", e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="modal-label">
              Phone <span className="req">*</span>
            </label>
            <input
              required
              type="tel"
              className="modal-input"
              placeholder="e.g. 08098765432"
              value={guarantor.phone}
              onChange={(e) => setG("phone", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="modal-label">
              Address <span className="req">*</span>
            </label>
            <input
              required
              type="text"
              className="modal-input"
              placeholder="e.g. 123 Main Street, Owerri, Imo State"
              value={guarantor.address}
              onChange={(e) => setG("address", e.target.value)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-cancel"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button type="submit" className="modal-submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyProfile() {
  const { user } = useAuth();
  const { data: meData, isLoading } = useGetMe();
  const [showEdit, setShowEdit] = useState(false);
  const [passportPhotoError, setPassportPhotoError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadPassport, isPending: uploading } = useUploadPassport();

  const profile = meData?.data?.profile;
  const nok = profile?.nextOfKin;

  const editInitial: UpdateStudentProfilePayload = {
    phone: "",
    guarantor: {
      name: nok?.name ?? "",
      relationship: nok?.relationship ?? "",
      phone: nok?.phone ?? "",
      address: nok?.address ?? "",
    },
  };

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "??";

  const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(
    /\/api(\/v\d+)?\/?$/,
    "",
  );

  return (
    <>
      <div className="page-container">
        {/* ── Header ── */}
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon purple">
              <User size={20} />
            </div>
            <div>
              <h2 className="page-title">My Profile</h2>
              <p className="page-sub">
                Your training profile and personal details
              </p>
            </div>
          </div>
          <div className="page-header-right">
            <AddButton
              text="Edit Profile"
              icon={<Pencil size={14} />}
              onClick={() => setShowEdit(true)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="mp-loading">Loading profile…</div>
        ) : (
          <div className="mp-grid">
            {/* ── LEFT: Identity Card ── */}
            <div className="mp-card">
              <div className="mp-avatar-wrap">
                <div className="mp-avatar">
                  {uploading ? (
                    <div className="mp-avatar-uploading">
                      <span className="mp-spinner" />
                    </div>
                  ) : profile?.passportPhoto && !passportPhotoError ? (
                    <img
                      src={`${apiBase}${profile.passportPhoto.startsWith("/") ? "" : "/"}${profile.passportPhoto}`}
                      alt="Student Passport"
                      className="mp-avatar-img"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "inherit",
                      }}
                      onError={() => setPassportPhotoError(true)}
                    />
                  ) : (
                    <div className="mp-avatar-initials">{initials}</div>
                  )}

                  <button
                    type="button"
                    className="mp-avatar-upload-btn"
                    title="Upload photo"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={14} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadPassport({ photo: file });
                    }}
                  />
                </div>
                <div className="mp-name">
                  {meData?.data.user.firstName} {meData?.data.user.lastName}
                </div>
                <div className="mp-email">{meData?.data.user.email}</div>
                <div className="mp-badges">
                  <span className="mp-role-badge">
                    {meData?.data.user.role}
                  </span>
                  {profile?.itStatus && (
                    <StatusBadge status={profile.itStatus} />
                  )}
                </div>
              </div>

              {/* Core info */}
              <div className="mp-info-list">
                <InfoRow label="Reg. No." value={profile?.registrationNumber} />
                <InfoRow
                  label="Department"
                  value={
                    profile?.department
                      ? `${profile.department.name} (${profile.department.code})`
                      : undefined
                  }
                />
                <InfoRow
                  label="Program"
                  value={
                    profile?.program
                      ? `${profile.program.type} – ${profile.program.level}`
                      : undefined
                  }
                />
                <InfoRow label="Session" value={profile?.session} />
                <InfoRow label="Batch" value={profile?.batch?.name} />
                <InfoRow label="Institution" value={profile?.institution?.name} />
              </div>
            </div>

            {/* ── RIGHT: Detail Sections ── */}
            <div className="mp-details">
              {/* IT Period */}
              {profile?.itPeriod && (
                <div className="mp-card">
                  <Section icon={<CalendarDays size={15} />} title="IT Period">
                    <div className="mp-info-list">
                      <InfoRow
                        label="Start Date"
                        value={formatDate(profile.itPeriod.startDate)}
                      />
                      <InfoRow
                        label="End Date"
                        value={formatDate(profile.itPeriod.endDate)}
                      />
                      <InfoRow
                        label="Duration"
                        value={`${profile.itPeriod.expectedDuration} weeks`}
                      />
                    </div>
                  </Section>
                </div>
              )}

              {/* Personal Details */}
              <div className="mp-card">
                <Section
                  icon={<IdCard size={15} />}
                  title="Personal Details"
                >
                  <div className="mp-info-list">
                    <InfoRow label="Gender" value={profile?.gender} />
                    <InfoRow
                      label="Date of Birth"
                      value={
                        profile?.dateOfBirth
                          ? formatDate(profile.dateOfBirth)
                          : undefined
                      }
                    />
                    <InfoRow label="Address" value={profile?.address} />
                    <InfoRow
                      label="State of Origin"
                      value={profile?.stateOfOrigin}
                    />
                    <InfoRow label="Nationality" value={profile?.nationality} />
                    <InfoRow
                      label="Professional Reg. No."
                      value={profile?.professionalRegNumber}
                    />
                  </div>
                </Section>
              </div>

              {/* School Supervisor */}
              {profile?.supervisors?.school && (
                <div className="mp-card">
                  <Section
                    icon={<UserCheck size={15} />}
                    title="Clinical Supervisor"
                  >
                    <div className="mp-info-list">
                      <InfoRow
                        label="Staff ID"
                        value={profile.supervisors.school.staffId}
                      />
                      <InfoRow
                        label="Specialization"
                        value={profile.supervisors.school.specialization}
                      />
                    </div>
                  </Section>
                </div>
              )}

              {/* Next of Kin */}
              {nok && (
                <div className="mp-card">
                  <Section
                    icon={<ShieldCheck size={15} />}
                    title="Next of Kin"
                  >
                    <div className="mp-info-list">
                      <InfoRow label="Name" value={nok.name} />
                      <InfoRow label="Relationship" value={nok.relationship} />
                      <InfoRow label="Phone" value={nok.phone} />
                      <InfoRow label="Address" value={nok.address} />
                    </div>
                  </Section>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <EditProfileModal
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          initial={editInitial}
        />
      )}
    </>
  );
}
