import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from '../Accounts/UserContext';
import "./Navbar.css";
import FirstLogo from "../First_logo.png";
import { AiOutlineUser } from "react-icons/ai";

const isActive = (path, currentPath) => path === currentPath;

const NavbarButton = ({ path, label, icon, onClick, isActive }) => (
  <div className={`nav-item ${isActive ? "active" : ""}`}>
    <button
      onClick={onClick}
      className="nav-button"
      aria-label={label}
      style={{ border: 'none', background: 'none' }}
    >
      {icon && <span className="nav-icon">{icon}</span>}
      <p>{label}</p>
    </button>
  </div>
);

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, fetchUser, logout } = useUser();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isProjectPage = location.pathname.startsWith('/projects');

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

  const handleProfileNavigation = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) return navigate("/login");

    if (currentUser?.username) {
      return navigate("/profile");
    }

    await fetchUser();
    const updated = JSON.parse(localStorage.getItem("user"));
    if (updated?.username) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(Boolean(token));
  }, [location]);

  if (location.pathname === '/jagan-yetukuri') {
    return null;
  }

  return (
    <nav className={`navbar ${isMobile ? "mobile" : ""} ${isProjectPage ? "alt-navbar" : ""}`}>
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
          path="/notes"
          label="EDURA"
          onClick={() => handleNavigation("/notes")}
          isActive={isActive("/notes", location.pathname)}
        />
        <NavbarButton
          path="/project-suggestions"
          label="BUILDZONE"
          onClick={() => handleNavigation("/project-suggestions")}
          isActive={isActive("/project-suggestions", location.pathname)}
        />
      </div>

      {isAuthenticated ? (
        <div style={{ display: 'flex' }}>
          <NavbarButton
            path="/profile"
            label="PROFILE"
            icon={<AiOutlineUser />}
            onClick={handleProfileNavigation}
            isActive={
              isActive("/profile", location.pathname) ||
              location.pathname.startsWith('/profile/')
            }
          />
          <button
            onClick={logout}
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
    </nav>
  );
};

export default Navbar;