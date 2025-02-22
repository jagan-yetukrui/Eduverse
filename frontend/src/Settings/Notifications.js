import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Switch, FormControlLabel } from '@mui/material';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    interaction_notifications: {
      likes: true,
      comments: true,
      follows: true,
      mentions: true
    },
    content_notifications: {
      posts: true,
      highlights: true,
      education_updates: true,
      experience_updates: true
    },
    privacy_notifications: {
      profile_views: true,
      account_activity: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch notification settings
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/profiles/me/notifications/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationSettings();
  }, []);

  // Handle notification toggle
  const handleToggle = (category, subcategory = null) => (event) => {
    if (subcategory) {
      setNotifications(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [subcategory]: event.target.checked
        }
      }));
    } else {
      setNotifications(prev => ({
        ...prev,
        [category]: event.target.checked
      }));
    }
  };

  // Save notification settings
  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.patch('/api/profiles/me/notifications/', notifications, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Notification settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !notifications) {
    return <div>Loading notification settings...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="notifications-container">
      <h2>Notification Settings</h2>
      
      {/* General Notifications */}
      <section className="notification-section">
        <h3>General Notifications</h3>
        <FormControlLabel
          control={
            <Switch
              checked={notifications.email_notifications}
              onChange={handleToggle('email_notifications')}
            />
          }
          label="Email Notifications"
        />
        <FormControlLabel
          control={
            <Switch
              checked={notifications.push_notifications}
              onChange={handleToggle('push_notifications')}
            />
          }
          label="Push Notifications"
        />
      </section>

      {/* Interaction Notifications */}
      <section className="notification-section">
        <h3>Interaction Notifications</h3>
        {Object.entries(notifications.interaction_notifications).map(([key, value]) => (
          <FormControlLabel
            key={key}
            control={
              <Switch
                checked={value}
                onChange={handleToggle('interaction_notifications', key)}
              />
            }
            label={key.charAt(0).toUpperCase() + key.slice(1)}
          />
        ))}
      </section>

      {/* Content Notifications */}
      <section className="notification-section">
        <h3>Content Notifications</h3>
        {Object.entries(notifications.content_notifications).map(([key, value]) => (
          <FormControlLabel
            key={key}
            control={
              <Switch
                checked={value}
                onChange={handleToggle('content_notifications', key)}
              />
            }
            label={key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          />
        ))}
      </section>

      {/* Privacy Notifications */}
      <section className="notification-section">
        <h3>Privacy Notifications</h3>
        {Object.entries(notifications.privacy_notifications).map(([key, value]) => (
          <FormControlLabel
            key={key}
            control={
              <Switch
                checked={value}
                onChange={handleToggle('privacy_notifications', key)}
              />
            }
            label={key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          />
        ))}
      </section>

      <div className="actions">
        <button 
          className="save-button"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {error && (
        <div className="error-message">{error}</div>
      )}
    </div>
  );
};

export default Notifications;
