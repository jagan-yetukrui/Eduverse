import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import FirstLogo from "../First_logo.png";
import {
  AiFillHome,
  AiOutlineSearch,
  AiFillMessage,
  AiOutlineGlobal,
  AiFillPlusSquare,
  AiOutlineUser,
} from "react-icons/ai";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsAuthenticated(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const refreshHomePage = () => {
    if (location.pathname === "/") {
      window.location.reload();
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // get token from local storage
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(Boolean(token));
  }, [location]);

  return (
    <nav className={`navbar ${isMobile ? "mobile" : ""}`}>
      <div className="nav-item-container">
        <div className="logo-container-nav" onClick={refreshHomePage}>
          <img src={FirstLogo} alt="EduVerse" className="nav-logo" />
          <p>EduVerse</p>
        </div>

        {/* <div className="nav-item">
          <button onClick={() => navigate("/")} className="nav-button">
            <p>HOME</p>
          </button>
        </div> */}

        <div className="nav-item">
          <button onClick={() => navigate("/search")} className="nav-button">
            {/* <AiOutlineSearch className="nav-icon" /> */}
            <p>SEARCH</p>
          </button>
        </div>

        <div className="nav-item">
          <button onClick={() => navigate("/messages")} className="nav-button">
            {/* <AiFillMessage className="nav-icon" /> */}
            <p>MESSAGES</p>
          </button>
        </div>

        <div className="nav-item">
          <button onClick={() => navigate("/notes")} className="nav-button">
            {/* <AiOutlineGlobal className="nav-icon" /> */}
            <p>EDURA</p>
          </button>
        </div>

        <div className="nav-item">
          <button onClick={() => navigate("/newpost")} className="nav-button">
            {/* <AiFillPlusSquare className="nav-icon" /> */}
            <p>NEW POST</p>
          </button>
        </div>
      </div>

      {isAuthenticated ? (
        <div className="nav-item nav-profile">
          <button onClick={handleLogout} className="nav-button logout">
            {/* <AiOutlineUser className="nav-icon" /> */}
            {/* <p>PROFILE</p> */}
            <p>LOGOUT</p>
          </button>
          <button onClick={() => navigate("/profile")} className="nav-button">
            {/* <AiOutlineUser className="nav-icon" /> */}
            {/* <p>PROFILE</p> */}
            <p>
              <AiOutlineUser />
            </p>
          </button>
        </div>
      ) : (
        <div className="nav-item nav-profile">
          <button
            onClick={() => navigate("/login")}
            className="nav-item nav-button"
          >
            LOGIN
          </button>
          <button
            onClick={() => navigate("/register")}
            className="nav-item nav-button"
          >
            REGISTER
          </button>
        </div>
      )}

      {isMobile && (
        <button
          className="mobile-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className={`hamburger ${isExpanded ? "active" : ""}`}></div>
        </button>
      )}
    </nav>
  );
};

export default Navbar;
