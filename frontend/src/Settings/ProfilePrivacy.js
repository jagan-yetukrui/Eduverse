import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tooltip } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

const ProfilePrivacy = () => {
  const [settings, setSettings] = useState({
    profile_visibility: 'public',
    posts_visibility: 'public',
    followers_visibility: 'public',
    following_visibility: 'public',
    account_status: 'active'
  });
  const [originalSettings, setOriginalSettings] = useState({});
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Fetch current privacy settings from the backend
  useEffect(() => {
    const fetchPrivacySettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/profiles/me/privacy/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSettings(response.data);
        setOriginalSettings(response.data);
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
        setFeedback({
          message: error.response?.data?.detail || 'Failed to load privacy settings.',
          type: 'error'
        });
      }
    };
    fetchPrivacySettings();
  }, []);

  // Handle saving the updated privacy settings
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/profiles/me/privacy/', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedback({
        message: 'Privacy settings updated successfully!',
        type: 'success'
      });
      setOriginalSettings(settings);
    } catch (error) {
      setFeedback({
        message: error.response?.data?.detail || 'Failed to update privacy settings.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle resetting settings to original state
  const handleResetChanges = () => {
    setSettings(originalSettings);
    setFeedback({
      message: 'Settings reset to last saved state.',
      type: 'info'
    });
  };

  // Handle setting changes
  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="settings-section">
      <h2>Profile Privacy Settings</h2>
      
      <div className="privacy-option">
        <Tooltip title="Control who can view your profile information" placement="right">
          <div className="setting-group">
            <label>Profile Visibility:</label>
            <ToggleButtonGroup
              value={settings.profile_visibility}
              exclusive
              onChange={(e, value) => handleSettingChange('profile_visibility', value)}
            >
              <ToggleButton value="public">Public</ToggleButton>
              <ToggleButton value="private">Private</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </Tooltip>
      </div>

      <div className="privacy-option">
        <Tooltip title="Control who can see your posts" placement="right">
          <div className="setting-group">
            <label>Posts Visibility:</label>
            <ToggleButtonGroup
              value={settings.posts_visibility}
              exclusive
              onChange={(e, value) => handleSettingChange('posts_visibility', value)}
            >
              <ToggleButton value="public">Public</ToggleButton>
              <ToggleButton value="friends">Friends Only</ToggleButton>
              <ToggleButton value="private">Private</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </Tooltip>
      </div>

      <div className="privacy-option">
        <Tooltip title="Control who can see your followers list" placement="right">
          <div className="setting-group">
            <label>Followers List Visibility:</label>
            <ToggleButtonGroup
              value={settings.followers_visibility}
              exclusive
              onChange={(e, value) => handleSettingChange('followers_visibility', value)}
            >
              <ToggleButton value="public">Public</ToggleButton>
              <ToggleButton value="private">Only Me</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </Tooltip>
      </div>

      <div className="privacy-option">
        <Tooltip title="Control who can see accounts you follow" placement="right">
          <div className="setting-group">
            <label>Following List Visibility:</label>
            <ToggleButtonGroup
              value={settings.following_visibility}
              exclusive
              onChange={(e, value) => handleSettingChange('following_visibility', value)}
            >
              <ToggleButton value="public">Public</ToggleButton>
              <ToggleButton value="private">Only Me</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </Tooltip>
      </div>

      <div className="buttons-container">
        <button className="save-button" onClick={handleSaveChanges}>
          Save Changes
        </button>
        <button className="reset-button" onClick={handleResetChanges}>
          Reset Changes
        </button>
      </div>

      {feedback.message && <p className={`feedback ${feedback.type === 'error' ? 'error' : 'success'}`}>
        {feedback.message}
      </p>}
    </div>
  );
};

export default ProfilePrivacy;
