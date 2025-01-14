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
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const refreshHomePage = () => {
    if (location.pathname === "/") {
      window.location.reload();
    } else {
      navigate("/");
    }
  };

  const navItems = [
    { path: "/", label: "Home", icon: <AiFillHome />, tooltip: "Home" },
    {
      path: "/search",
      label: "Search",
      icon: <AiOutlineSearch />,
      tooltip: "Search",
    },
    {
      path: "/messages",
      label: "Messages",
      icon: <AiFillMessage />,
      tooltip: "Messages",
    },
    {
      path: "/notes",
      label: "Edura",
      icon: <AiOutlineGlobal />,
      tooltip: "AI Assistant",
    },
    {
      path: "/newpost",
      label: "New Post",
      icon: <AiFillPlusSquare />,
      tooltip: "Create Post",
    },
    {
      path: "/profile",
      label: "Profile",
      icon: <AiOutlineUser />,
      tooltip: "Profile",
    },
  ];

  const playHoverSound = () => {
    const audio = new Audio("/hover-sound.mp3");
    audio.volume = 0.1;
    audio.play().catch(() => {});
  };

  return (
    <motion.nav
      className={`navbar ${isExpanded ? "expanded" : ""} ${
        isMobile ? "mobile" : ""
      }`}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onMouseEnter={() => !isMobile && setIsExpanded(true)}
      onMouseLeave={() => !isMobile && setIsExpanded(false)}
    >
      <div className="navbar-background">
        <div className="gradient-overlay"></div>
        <div className="particle-container"></div>
      </div>

      <motion.div
        className="logo-container-nav"
        onClick={refreshHomePage}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.img
          src={FirstLogo}
          alt="EduVerse"
          className="nav-logo"
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              className="app-title"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              EduVerse
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      

      <div className="nav-items">
  {navItems.map((item) => (
    <div
      key={item.path}
      className="nav-item-container"
    >
      <Link
        to={item.path}
        className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
        data-tooltip={item.tooltip}
        onMouseEnter={playHoverSound}
      >
        <div className="nav-icon-container">
          <div className="nav-icon">
            {item.icon}
            {location.pathname === item.path && (
              <div className="active-indicator" />
            )}
          </div>
        </div>
        <div className="nav-label-container">
          {isExpanded && (
            <span className="nav-label">
              {item.label}
            </span>
          )}
        </div>
      </Link>
    </div>
  ))}
</div>


      {isMobile && (
        <motion.button
          className="mobile-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className={`hamburger ${isExpanded ? "active" : ""}`}></div>
        </motion.button>
      )}
    </motion.nav>
  );
};

export default Navbar;
