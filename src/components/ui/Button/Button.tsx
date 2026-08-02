import React from "react";
import "./Button.css";

interface ButtonProps {
  text: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  className = "",
  type = "button",
}) => {
  const buttonClasses = [
    "btn-standard",
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? "btn-full-width" : "",
    loading ? "btn-loading" : "",
    className,
  ]
    .join(" ")
    .trim();

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="btn-spinner" />}

      {!loading && icon && iconPosition === "left" && (
        <span className="btn-icon left">{icon}</span>
      )}

      <span className="btn-text">{loading ? "Please wait..." : text}</span>

      {!loading && icon && iconPosition === "right" && (
        <span className="btn-icon right">{icon}</span>
      )}
    </button>
  );
};

export default Button;
