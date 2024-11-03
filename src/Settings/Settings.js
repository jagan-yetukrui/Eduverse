import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import axios from 'axios';
import { FaUserShield, FaBell, FaLock, FaBan, FaQuestionCircle } from 'react-icons/fa'; // Import React Icons
import './Settings.css';

const Settings = () => {
  const [originalSettings, setOriginalSettings] = useState(null);  // Stores the original settings
  const [currentSettings, setCurrentSettings] = useState({});      // Stores the current modified settings
  const [feedback, setFeedback] = useState('');                    // Feedback to user
  
  // Fetch the original settings from the backend when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5002/api/user/settings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOriginalSettings(response.data);       // Set original settings
        setCurrentSettings(response.data);        // Set the current editable settings
      } catch (error) {
        console.error('Error fetching settings:', error);
        setFeedback('Failed to load settings.');
      }
    };
    fetchSettings();
  }, []);

  // Handle saving changes to the backend
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5002/api/user/settings', currentSettings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedback('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setFeedback('Failed to save settings.');
    }
  };

  // Handle resetting to original settings
  const handleResetToOriginal = () => {
    setCurrentSettings(originalSettings);
    setFeedback('Settings reset to original values.');
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
      
      <div className="settings-content">
        <Outlet />
        
        {/* Buttons to Save Changes and Reset */}
        <div className="settings-actions">
          <button className="save-button" onClick={handleSaveChanges}>Save Changes</button>
          <button className="reset-button" onClick={handleResetToOriginal}>Back to Original Settings</button>
        </div>
        
        {/* Feedback Section */}
        {feedback && <p className="feedback">{feedback}</p>}
      </div>
    </div>
  );
};

export default Settings;
