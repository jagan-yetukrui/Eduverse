import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import FirstLogo from "../First_logo.png";
import { AiOutlineUser } from "react-icons/ai";

// Utility function to determine if a path is active
const isActive = (path, currentPath) => path === currentPath;

const NavbarButton = ({ path, label, icon, onClick, isActive }) => (
  <div className={`nav-item ${isActive ? "active" : ""}`}>
    <button onClick={onClick} className="nav-button" aria-label={label} style={{ border: 'none', background: 'none' }}>
      {icon && <span className="nav-icon">{icon}</span>}
      <p>{label}</p>
    </button>
  </div>
);

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const handleNavigation = (path) => {
    if (location.pathname === path) {
      window.location.reload();
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(Boolean(token));
  }, [location]);

  return (
    <nav className={`navbar ${isMobile ? "mobile" : ""}`} aria-label="Main Navigation">
      <div className="nav-item-container">
        <div className="logo-container-nav" onClick={() => handleNavigation("/")}>
          <img src={FirstLogo} alt="EduVerse" className="nav-logo" />
          <p>EduVerse</p>
        </div>

        <NavbarButton
          path="/search"
          label="SEARCH"
          onClick={() => handleNavigation("/search")}
          isActive={isActive("/search", location.pathname)}
        />

        <NavbarButton
          path="/messages"
          label="MESSAGES"
          onClick={() => handleNavigation("/messages")}
          isActive={isActive("/messages", location.pathname)}
        />

        <NavbarButton
          path="/notes"
          label="EDURA"
          onClick={() => handleNavigation("/notes")}
          isActive={isActive("/notes", location.pathname)}
        />

        <NavbarButton
          path="/newpost"
          label="NEW POST"
          onClick={() => handleNavigation("/newpost")}
          isActive={isActive("/newpost", location.pathname)}
        />
      </div>

      {isAuthenticated ? (
        <div style={{ display: 'flex' }}>
          <NavbarButton
            path="/profile"
            label="PROFILE"
            icon={<AiOutlineUser />}
            onClick={() => handleNavigation("/profile")}
            isActive={isActive("/profile", location.pathname)}
          />
          <button
            onClick={handleLogout}
            className="nav-item nav-button"
            aria-label="Logout"
            style={{ border: 'none', background: 'none' }}
          >
            LOGOUT
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => handleNavigation("/login")}
            className="nav-item nav-button"
            aria-label="Login"
            style={{ border: 'none', background: 'none' }}
          >
            LOGIN
          </button>
          <button
            onClick={() => handleNavigation("/register")}
            className="nav-item nav-button"
            aria-label="Register"
            style={{ border: 'none', background: 'none' }}
          >
            REGISTER
          </button>
        </div>
      )}

      {isMobile && (
        <button
          className="mobile-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label="Toggle navigation"
        >
          <div className={`hamburger ${isExpanded ? "active" : ""}`}></div>
        </button>
      )}
    </nav>
  );
};

export default Navbar;
