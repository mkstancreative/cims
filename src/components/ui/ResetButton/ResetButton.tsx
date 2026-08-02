import { type CSSProperties } from "react";
import "./ResetButton.css";

interface ResetButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    style?: CSSProperties;
}

function ResetButton({
    onClick,
    disabled,
    loading = false,
    style
}: ResetButtonProps) {
    return (
        <div>
            <button
                type="button"
                onClick={onClick}
                disabled={disabled || loading}
                className={`reset-button ${loading ? "loading" : ""}`}
                aria-disabled={disabled || loading}
                style={style}
            >
                {loading ? "Resetting..." : "Reset Filters"}
            </button>
        </div>
    );
}

export default ResetButton;