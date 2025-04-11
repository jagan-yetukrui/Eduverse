import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUserShield, 
  FaBell, 
  FaLock, 
  FaBan, 
  FaQuestionCircle,
  FaMoon 
} from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  // State management for settings and UI
  const [originalSettings, setOriginalSettings] = useState(null);
  const [currentSettings, setCurrentSettings] = useState({});
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => 
    localStorage.getItem('darkMode') === 'true'
  );
  const navigate = useNavigate();

  // Apply dark mode effect
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Fetch initial settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const access_token = localStorage.getItem('access_token');
        if (!access_token) {
          throw new Error('No access token found');
        }

        // API call to fetch user settings
        const response = await axios.get('http://127.0.0.1:8000/api/profiles/me/settings/', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        // Update state with fetched settings
        setOriginalSettings({
          ...response.data,
          darkMode: darkMode // Include dark mode in settings
        });
        setCurrentSettings({
          ...response.data,
          darkMode: darkMode
        });
        setFeedback({ message: 'Settings loaded successfully', type: 'success' });
      } catch (error) {
        const errorMessage = error.response?.data?.detail || error.message;
        console.error('Error fetching settings:', {
          message: errorMessage,
          status: error.response?.status,
          data: error.response?.data
        });
        setError(errorMessage);
        setFeedback({
          message: 'Failed to load settings. Please try again later.',
          type: 'error'
        });
        
        // Redirect to login if unauthorized
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [navigate, darkMode]);

  // Handle saving updated settings
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const access_token = localStorage.getItem('access_token');
      if (!access_token) {
        throw new Error('No access token found');
      }

      // API call to update settings
      const response = await axios.put(
        'http://127.0.0.1:8000/api/profiles/me/settings/',
        currentSettings,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setOriginalSettings(response.data);
      setFeedback({
        message: 'Settings updated successfully!',
        type: 'success'
      });
      
      // Delayed navigation to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message;
      console.error('Error updating settings:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data
      });
      
      setFeedback({
        message: `Failed to update settings: ${errorMessage}`,
        type: 'error'
      });

      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset settings to original values
  const handleResetToOriginal = () => {
    setCurrentSettings(originalSettings);
    setFeedback({
      message: 'Settings have been reset to original values',
      type: 'info'
    });
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setFeedback({
      message: 'You have been successfully logged out',
      type: 'success'
    });
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  // Toggle dark mode
  const handleDarkModeToggle = () => {
    setDarkMode(prev => !prev);
    setCurrentSettings(prev => ({
      ...prev,
      darkMode: !darkMode
    }));
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="settings-loading">
        <p>Loading your settings...</p>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="settings-error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className={`settings-container ${darkMode ? 'dark-mode' : ''}`}>
      <h2>Settings</h2>

      <div className="settings-grid">
        <Link to="/settings/profile-privacy" className="settings-link">
          <FaUserShield size={50} />
          <span>Profile Privacy</span>
        </Link>

        <Link to="/settings/notifications" className="settings-link">
          <FaBell size={50} />
          <span>Notification Preferences</span>
        </Link>

        <Link to="/settings/account-security" className="settings-link">
          <FaLock size={50} />
          <span>Account Security</span>
        </Link>

        <Link to="/settings/blocked" className="settings-link">
          <FaBan size={50} />
          <span>Blocked Users</span>
        </Link>

        <Link to="/settings/help" className="settings-link">
          <FaQuestionCircle size={50} />
          <span>Help & Support</span>
        </Link>

        {/* Dark Mode Toggle */}
        <div className="settings-link" onClick={handleDarkModeToggle}>
          <FaMoon size={50} />
          <span>Dark Mode: {darkMode ? 'On' : 'Off'}</span>
        </div>
      </div>

      <div className="settings-content">
        <Outlet context={{ currentSettings, setCurrentSettings }} />

        <div className="settings-actions">
          <button 
            className="save-button" 
            onClick={handleSaveChanges}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            className="reset-button" 
            onClick={handleResetToOriginal}
            disabled={loading}
          >
            Reset Changes
          </button>
          <button 
            className="logout-button" 
            onClick={handleLogout}
            disabled={loading}
          >
            Logout
          </button>
        </div>

        {/* Dynamic feedback message */}
        {feedback.message && (
          <p className={`feedback ${feedback.type}`}>
            {feedback.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Settings;
