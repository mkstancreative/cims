import React from "react";
import { Plus } from "lucide-react";
import "./AddButton.css";

interface AddButtonProps {
  text?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

function AddButton({
  text = "Add",
  onClick,
  icon,
  disabled,
  loading,
}: AddButtonProps) {
  return (
    <button
      className="add-btn"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="isr-spinner-sm" style={{ marginRight: 8 }} />
      ) : icon ? (
        icon
      ) : (
        <Plus size={16} />
      )}
      {loading ? "Processing..." : text}
    </button>
  );
}

export default AddButton;
