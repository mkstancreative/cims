import React from "react";
import "./StatCard.css";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  return (
    <div className="stat-card-premium" style={{ color: color }}>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <h3 className="stat-value">{value}</h3>
      </div>
      <div
        className="stat-icon-wrapper"
        style={{ background: `${color}15`, color: color }}
      >
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
