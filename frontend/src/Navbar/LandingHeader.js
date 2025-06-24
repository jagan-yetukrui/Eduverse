import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingHeader.css";
import NewLogo from "../New_Logo.png";

const LandingHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="landing-header">
      <div className="header-left">
        <div className="logo-box">
          <img src={NewLogo} alt="EduVerse Logo" className="logo-img" />
          <span className="eduverse-title">EduVerse</span>
        </div>
      </div>
      <div className="header-right">
        <button
          className="header-btn login-btn"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
        <button
          className="header-btn register-btn"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </div>
    </header>
  );
};

export default LandingHeader; 