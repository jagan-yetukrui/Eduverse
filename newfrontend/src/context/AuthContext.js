import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount and when token changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('eduverseAuthToken');
      if (token) {
        setIsAuthenticated(true);
        // Here you could decode the JWT to get user info if needed
        // For now just set a basic user object
        setUser({ authenticated: true });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuthStatus();
    // Listen for storage events (when token is added/removed in another tab)
    window.addEventListener('storage', checkAuthStatus);
    return () => window.removeEventListener('storage', checkAuthStatus);
  }, []);

  // Function to handle login
  const login = (token, userData) => {
    localStorage.setItem('eduverseAuthToken', token);
    setIsAuthenticated(true);
    setUser(userData || { authenticated: true });
    
    // Dispatch a storage event to notify other tabs
    window.dispatchEvent(new Event('storage'));
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('eduverseAuthToken');
    setIsAuthenticated(false);
    setUser(null);
    
    // Dispatch a storage event to notify other tabs
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
