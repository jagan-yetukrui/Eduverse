import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import LandingHeader from '../Navbar/LandingHeader';
import FloatingMenu from '../Home/FloatingMenu';
import './Layout.css';

const Layout = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(Boolean(token));
  }, []);

  // Check if we're on the landing page (home route) and not authenticated
  const isLandingPage = location.pathname === '/' && !isAuthenticated;

  return (
    <div className="layout-container">
      {/* Show LandingHeader only on landing page for unauthenticated users */}
      {isLandingPage && <LandingHeader />}
      
      {/* Show Navbar for authenticated users on all pages except landing */}
      {isAuthenticated && !isLandingPage && <Navbar />}
      
      {/* Main content */}
      <main className="main-content">
        {children}
      </main>
      
      {/* Show FloatingMenu only on landing page for unauthenticated users */}
      {isLandingPage && <FloatingMenu />}
    </div>
  );
};

export default Layout; 