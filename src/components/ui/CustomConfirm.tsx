import React, { useState } from "react";
import CustomModal from "./CustomModal/CustomModal";
import Button from "./Button/Button";
import { AlertTriangle, HelpCircle } from "lucide-react";

interface CustomConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (inputValue?: string) => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "success" | "primary" | "info";
  showInput?: boolean;
  inputPlaceholder?: string;
  inputValue?: string;
  isLoading?: boolean;
  errors?: { id: string; reason: string }[];
}

const CustomConfirm: React.FC<CustomConfirmProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  showInput = false,
  inputPlaceholder = "Type something...",
  isLoading = false,
  errors = [],
}) => {
  const [text, setText] = useState("");

  const handleConfirm = () => {
    onConfirm(showInput ? text : undefined);
  };

  const Icon = variant === "danger" ? AlertTriangle : HelpCircle;
  const iconColor =
    variant === "danger"
      ? "#ef4444"
      : variant === "success"
        ? "#10b981"
        : variant === "info"
          ? "#3b82f6"
          : "#3b82f6";

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      size={errors.length > 0 ? "medium" : "default"}
      hideCloseButton
    >
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <div
          style={{
            background: `${iconColor}15`,
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            color: iconColor,
          }}
        >
          <Icon size={28} />
        </div>

        <h3
          style={{
            margin: "0 0 10px",
            fontSize: "18px",
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: "0 0 24px",
            fontSize: "14.5px",
            color: "#64748b",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>

        {errors.length > 0 && (
          <div
            style={{
              textAlign: "left",
              maxHeight: "200px",
              overflowY: "auto",
              background: "#fff1f2",
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid #fecaca",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#e11d48",
                textTransform: "uppercase",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <AlertTriangle size={14} />
              Failed Items ({errors.length})
            </div>
            {errors.map((err, idx) => (
              <div
                key={idx}
                style={{
                  padding: "8px 0",
                  borderTop: idx === 0 ? "none" : "1px solid #fee2e2",
                  fontSize: "13px",
                  color: "#475569",
                }}
              >
                <div style={{ fontWeight: 600, color: "#0f172a" }}>
                  ID: {err.id}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.8 }}>
                  {err.reason}
                </div>
              </div>
            ))}
          </div>
        )}

        {showInput && (
          <div style={{ marginBottom: "24px" }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={inputPlaceholder}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                fontSize: "14px",
                minHeight: "80px",
                outline: "none",
                transition: "border-color 0.2s",
                resize: "vertical",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>
        )}

        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <Button
            text={cancelText}
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          />
          <Button
            text={confirmText}
            variant={variant === "info" ? "primary" : variant}
            onClick={handleConfirm}
            loading={isLoading}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default CustomConfirm;
