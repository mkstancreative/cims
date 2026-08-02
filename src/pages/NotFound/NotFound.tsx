import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Ghost } from "lucide-react";
import "./NotFound.css";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="nf-container">
      <div className="nf-content">
        <div className="nf-visual">
          <div className="nf-404">404</div>
          <Ghost size={80} className="nf-ghost" />
        </div>

        <h1 className="nf-title">Oops! Page Missing</h1>
        <p className="nf-text">
          The page you're looking for was either deleted, renamed, or never
          existed in the first place.
        </p>

        <div className="nf-actions">
          <button className="nf-btn secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button className="nf-btn primary" onClick={() => navigate("/")}>
            <Home size={16} />
            Take Me Home
          </button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="nf-bg-circle nf-circle-1" />
      <div className="nf-bg-circle nf-circle-2" />
    </div>
  );
};

export default NotFound;
