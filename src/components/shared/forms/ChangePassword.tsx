import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useChangePassword } from "../../../hooks/useAuth";
import type { ChangePasswordPayload } from "../../../api/types/auth";
import "./ChangePassword.css";
import CustomModal from "../../ui/CustomModal/CustomModal";

interface FormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface ChangePasswordProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export default function ChangePassword({
  isOpen,
  onSuccess,
}: ChangePasswordProps) {
  const [form, setForm] = useState<FormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const { mutate: changePassword, isPending } = useChangePassword();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!form.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(form.newPassword)) {
      newErrors.newPassword = "Password must contain an uppercase letter";
    } else if (!/[a-z]/.test(form.newPassword)) {
      newErrors.newPassword = "Password must contain a lowercase letter";
    } else if (!/[0-9]/.test(form.newPassword)) {
      newErrors.newPassword = "Password must contain a number";
    } else if (!/[!@#$%^&*]/.test(form.newPassword)) {
      newErrors.newPassword =
        "Password must contain a special character (!@#$%^&*)";
    }

    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (
      form.currentPassword === form.newPassword &&
      form.currentPassword.trim()
    ) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload: ChangePasswordPayload = {
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
    };

    changePassword(payload, {
      onSuccess: () => {
        setForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        onSuccess();
      },
    });
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={() => {}}
      title="Change Your Password"
      subtitle="Update your password to keep your account secure"
      icon={<Lock size={18} />}
      hideCloseButton
    >
      <form
        onSubmit={handleSubmit}
        id="change-password-form"
        style={{ paddingTop: 16 }}
      >
        {/* Current Password */}
        <div className="form-group">
          <label htmlFor="currentPassword" className="modal-label">
            Current Password <span className="required">*</span>
          </label>
          <div className="password-input-wrapper">
            <input
              id="currentPassword"
              type={showPasswords.current ? "text" : "password"}
              className={`modal-input ${errors.currentPassword ? "error" : ""}`}
              value={form.currentPassword}
              onChange={(e) => handleChange("currentPassword", e.target.value)}
              placeholder="Enter your current password"
              disabled={isPending}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility("current")}
              disabled={isPending}
            >
              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.currentPassword && (
            <span className="form-error">{errors.currentPassword}</span>
          )}
        </div>

        {/* New Password */}
        <div className="form-group">
          <label htmlFor="newPassword" className="modal-label">
            New Password <span className="required">*</span>
          </label>
          <div className="password-input-wrapper">
            <input
              id="newPassword"
              type={showPasswords.new ? "text" : "password"}
              className={`modal-input ${errors.newPassword ? "error" : ""}`}
              value={form.newPassword}
              onChange={(e) => handleChange("newPassword", e.target.value)}
              placeholder="Enter your new password"
              disabled={isPending}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility("new")}
              disabled={isPending}
            >
              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && (
            <span className="form-error">{errors.newPassword}</span>
          )}
          <div className="password-requirements">
            <p className="requirements-label">Password must contain:</p>
            <ul className="requirements-list">
              <li className={form.newPassword.length >= 8 ? "met" : ""}>
                At least 8 characters
              </li>
              <li className={/[A-Z]/.test(form.newPassword) ? "met" : ""}>
                Uppercase letter
              </li>
              <li className={/[a-z]/.test(form.newPassword) ? "met" : ""}>
                Lowercase letter
              </li>
              <li className={/[0-9]/.test(form.newPassword) ? "met" : ""}>
                Number
              </li>
              <li className={/[!@#$%^&*]/.test(form.newPassword) ? "met" : ""}>
                Special character (!@#$%^&*)
              </li>
            </ul>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label htmlFor="confirmPassword" className="modal-label">
            Confirm Password <span className="required">*</span>
          </label>
          <div className="password-input-wrapper">
            <input
              id="confirmPassword"
              type={showPasswords.confirm ? "text" : "password"}
              className={`modal-input ${errors.confirmPassword ? "error" : ""}`}
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="Confirm your new password"
              disabled={isPending}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility("confirm")}
              disabled={isPending}
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="form-error">{errors.confirmPassword}</span>
          )}
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-button" disabled={isPending}>
          {isPending ? "Updating..." : "Update Password"}
        </button>
      </form>
    </CustomModal>
  );
}
