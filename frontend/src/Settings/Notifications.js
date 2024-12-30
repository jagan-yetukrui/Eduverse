import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    likes: true,
    comments: true,
    follows: true,
  });
  const [feedback, setFeedback] = useState('');

  // Fetch current notification preferences from the backend
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const token = localStorage.getItem('token');  // Assuming JWT authentication
        const response = await axios.get('http://localhost:5002/api/user/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data.notifications);
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
      await axios.put('http://localhost:5000/api/user/notifications', { notifications }, {
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
          name="email"
          checked={notifications.email}
          onChange={handleCheckboxChange}
        />
      </div>

      <div className="input-group">
        <label>SMS Notifications:</label>
        <input
          type="checkbox"
          name="sms"
          checked={notifications.sms}
          onChange={handleCheckboxChange}
        />
      </div>

      <div className="input-group">
        <label>Likes Notifications:</label>
        <input
          type="checkbox"
          name="likes"
          checked={notifications.likes}
          onChange={handleCheckboxChange}
        />
      </div>

      <div className="input-group">
        <label>Comments Notifications:</label>
        <input
          type="checkbox"
          name="comments"
          checked={notifications.comments}
          onChange={handleCheckboxChange}
        />
      </div>

      <div className="input-group">
        <label>Follows Notifications:</label>
        <input
          type="checkbox"
          name="follows"
          checked={notifications.follows}
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
