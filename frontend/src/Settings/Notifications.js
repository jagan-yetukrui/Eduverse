import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    sms_notifications: false,
    like_notifications: true,
    comment_notifications: true,
    follow_notifications: true,
  });
  const [feedback, setFeedback] = useState('');

  // Fetch current notification preferences from the backend
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/profiles/me/notification-settings/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        setFeedback('Failed to load notification settings.');
      }
    };
    fetchNotificationSettings();
  }, []);

  // Handle saving updated notification preferences
  const handleSaveNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/profiles/me/update-notification-settings/', notifications, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedback('Notification preferences updated successfully!');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setFeedback('Failed to update notification preferences.');
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  return (
    <div className="settings-section">
      <h3>Notification Preferences</h3>

      <div className="input-group">
        <label>Email Notifications:</label>
        <input
          type="checkbox"
          name="email_notifications"
          checked={notifications.email_notifications}
          onChange={handleCheckboxChange}
        />
      </div>

      <div className="input-group">
        <label>SMS Notifications:</label>
        <input
          type="checkbox"
          name="sms_notifications"
          checked={notifications.sms_notifications}
          onChange={handleCheckboxChange}
        />
      </div>

      <div className="input-group">
        <label>Likes Notifications:</label>
        <input
          type="checkbox"
          name="like_notifications"
          checked={notifications.like_notifications}
          onChange={handleCheckboxChange}
        />
      </div>

      <div className="input-group">
        <label>Comments Notifications:</label>
        <input
          type="checkbox"
          name="comment_notifications"
          checked={notifications.comment_notifications}
          onChange={handleCheckboxChange}
        />
      </div>

      <div className="input-group">
        <label>Follows Notifications:</label>
        <input
          type="checkbox"
          name="follow_notifications"
          checked={notifications.follow_notifications}
          onChange={handleCheckboxChange}
        />
      </div>

      <button className="save-button" onClick={handleSaveNotifications}>
        Save Notification Settings
      </button>
      {feedback && <p className="feedback">{feedback}</p>}
    </div>
  );
};

export default Notifications;
