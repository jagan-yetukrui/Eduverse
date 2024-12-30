import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserShield, FaBell, FaLock, FaBan, FaQuestionCircle } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const [originalSettings, setOriginalSettings] = useState(null); // Store the initial settings fetched from the backend
  const [currentSettings, setCurrentSettings] = useState({}); // Track current settings being edited
  const [feedback, setFeedback] = useState(''); // Display feedback messages for user actions
  const navigate = useNavigate(); // Navigate to different routes

  // Fetch user settings when the component is mounted
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve JWT token from localStorage
        const response = await axios.get('http://localhost:5000/api/settings', {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in request headers
          },
        });
        setOriginalSettings(response.data); // Set original settings for resetting
        setCurrentSettings(response.data); // Populate current settings with fetched data
      } catch (error) {
        if (error.response?.status === 404) {
          setFeedback('Settings not found. Please check the URL or try again.');
        } else {
          console.error('Error fetching settings:', error.response?.data || error.message);
          setFeedback('Failed to load settings. Please try again later.');
        }
      }
    };

    fetchSettings();
  }, []);

  // Save updated settings to the backend
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/settings/update',
        currentSettings,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in request headers
          },
        }
      );

      if (response.status === 200) {
        setFeedback('Settings updated successfully!');
        setOriginalSettings(currentSettings); // Update original settings after save
        navigate('/dashboard'); // Redirect to the dashboard after saving
      }
    } catch (error) {
      setFeedback('Failed to update settings. Please try again.');
      console.error('Error updating settings:', error.response?.data || error.message);
    }
  };

  // Reset settings to their original state
  const handleResetToOriginal = () => {
    setCurrentSettings(originalSettings);
    setFeedback('Changes have been reset.');
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear token from localStorage
    setFeedback('You have been logged out.');
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      {/* Icon-based grid for different setting options */}
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
      </div>

      {/* Content section to render nested routes */}
      <div className="settings-content">
        <Outlet />

        {/* Buttons to Save Changes, Reset, and Logout */}
        <div className="settings-actions">
          <button className="save-button" onClick={handleSaveChanges}>
            Save Changes
          </button>
          <button className="reset-button" onClick={handleResetToOriginal}>
            Back to Original Settings
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Feedback Section */}
        {feedback && <p className="feedback">{feedback}</p>}
      </div>
    </div>
  );
};

export default Settings;
