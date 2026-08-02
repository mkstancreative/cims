import React from "react";
import "./Toggler.css";

interface TogglerProps {
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

function Toggler({ checked, onChange, disabled }: TogglerProps) {
    return (
        <label className={`toggle-switch ${disabled ? "disabled" : ""}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
            <span className="slider" />
        </label>
    );
}

export default Toggler;