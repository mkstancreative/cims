import React from "react";
import { Calendar } from "lucide-react";
import "./DateFilter.css";

interface DateFilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
}

const DateFilter: React.FC<DateFilterProps> = ({
  label,
  value,
  onChange,
  name,
}) => {
  return (
    <div className="date-filter-wrap">
      <label className="date-filter-label">{label}</label>
      <div className="date-input-container">
        <input
          type="date"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="date-input-field"
        />
        <Calendar size={15} className="date-input-icon" />
      </div>
    </div>
  );
};

export default DateFilter;
