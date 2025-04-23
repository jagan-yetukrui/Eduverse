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

  // Fetch initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch all settings in parallel
        const [profileResponse, privacyResponse, notificationResponse] = await Promise.all([
          axios.get('/api/profiles/me/', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/profiles/me/privacy/', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/profiles/me/notifications/', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const combinedSettings = {
          profile: profileResponse.data,
          privacy: privacyResponse.data,
          notifications: notificationResponse.data,
          darkMode
        };

        setOriginalSettings(combinedSettings);
        setCurrentSettings(combinedSettings);
        setFeedback({ message: 'Settings loaded successfully', type: 'success' });
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [navigate, darkMode]);

  const handleError = (error) => {
    const errorMessage = error.response?.data?.detail || error.message;
    console.error('Error:', {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
    setError(errorMessage);
    setFeedback({
      message: 'Failed to load settings. Please try again later.',
      type: 'error'
    });
    
    if (error.response?.status === 401) {
      navigate('/login');
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      // Update different settings in parallel
      await Promise.all([
        axios.put('/api/profiles/me/', currentSettings.profile, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.put('/api/profiles/me/privacy/', currentSettings.privacy, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.put('/api/profiles/me/notifications/', currentSettings.notifications, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setOriginalSettings(currentSettings);
      setFeedback({
        message: 'Settings updated successfully!',
        type: 'success'
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetToOriginal = () => {
    setCurrentSettings(originalSettings);
    setFeedback({
      message: 'Settings have been reset to original values',
      type: 'info'
    });
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('/api/profiles/logout/', null, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setFeedback({
        message: 'You have been successfully logged out',
        type: 'success'
      });
      setTimeout(() => navigate('/login'), 1000);
    }
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
