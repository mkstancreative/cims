import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import "./CustomModal.css";

type ModalSize = "default" | "wide" | "large" | "medium" | "full";
type ModalPlacement = "center" | "top";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  size?: ModalSize;
  placement?: ModalPlacement;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  hideCloseButton?: boolean;
}

function CustomModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  size = "default",
  placement = "center",
  children,
  footer,
  isLoading = false,
  hideCloseButton = false,
}: CustomModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div className={`modal-overlay placement-${placement}`}>
      <div
        className={`modal-card ${size === "wide" ? "modal-wide" : ""} ${size === "large" ? "modal-large" : ""} ${size === "medium" ? "modal-medium" : ""} ${size === "default" ? "modal-default" : ""}`}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="modal-header">
          <div>
            <div className="modal-title">
              {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
              {title}
            </div>
            {subtitle && <div className="modal-sub">{subtitle}</div>}
          </div>

          {!hideCloseButton && (
            <button className="modal-close" onClick={onClose}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* BODY */}
        <div className="modal-body">
          {isLoading ? (
            <div className="modal-loading">
              <div className="modal-skel modal-skel--title" />
              <div className="modal-skel modal-skel--line" />
              <div className="modal-skel modal-skel--short" />
              <div className="modal-skel modal-skel--block" />
              <div className="modal-skel modal-skel--short" />
            </div>
          ) : (
            children
          )}
        </div>

        {/* FOOTER */}
        {footer && <div className="modal-actions">{footer}</div>}
      </div>
    </div>
  );
  return ReactDOM.createPortal(content, document.body);
}
export default CustomModal;
