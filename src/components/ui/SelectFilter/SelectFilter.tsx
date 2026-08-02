import React, { useState, useRef, useEffect } from "react";
import "./SelectFilter.css";

interface Option {
  value: string;
  label: string;
}

interface SelectFilterProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  name: string;
}

const SelectFilter: React.FC<SelectFilterProps> = ({
  label,
  options,
  value,
  onChange,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const selectedOption =
    options.find((opt) => opt.value === value) ||
    options.find((opt) => opt.value === ""); // Attempt to find default
  const displayLabel = selectedOption ? selectedOption.label : "Select...";

  return (
    <div className="filter-container" data-name={name}>
      <label className="filter-label">{label}</label>
      <div
        className={`select-wrapper custom-select-wrapper ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        ref={containerRef}
      >
        <div
          className={`filter-select custom-select-display ${!value ? "placeholder-active" : ""}`}
        >
          {displayLabel}
        </div>

        <div className="icon-group">
          {value && (
            <button type="button" className="clear-btn" onClick={handleClear}>
              ×
            </button>
          )}
          <span className={`chevron ${isOpen ? "open" : ""}`}></span>
        </div>

        {isOpen && (
          <div className="custom-options-list">
            {options
              .filter((opt) => opt.value !== "")
              .map((opt) => (
                <div
                  key={opt.value}
                  className={`custom-option ${opt.value === value ? "selected" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt.value);
                  }}
                >
                  {opt.label}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectFilter;
