import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle } from "lucide-react";
import "./ConfirmModal.css";

type ConfirmModalVariant = "danger" | "success" | "warning";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
}

function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  isPending = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="confirm-overlay" onClick={onCancel}>
      <div
        className={`confirm-card confirm-${variant}`}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`confirm-icon-wrap confirm-icon-${variant}`}>
          {variant === "success" ? (
            <CheckCircle size={28} />
          ) : (
            <AlertTriangle size={28} />
          )}
        </div>

        {/* Text */}
        <h3 className="confirm-title">{title}</h3>
        {message && <p className="confirm-message">{message}</p>}

        {/* Actions */}
        <div className="confirm-actions">
          <button
            className="confirm-cancel-btn"
            onClick={onCancel}
            disabled={isPending}
          >
            {cancelText}
          </button>
          <button
            className={`confirm-submit-btn confirm-submit-${variant}`}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? <span className="confirm-spinner" /> : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ConfirmModal;
