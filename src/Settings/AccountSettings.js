import React, { useState } from 'react';
import axios from 'axios';
import './AccountSettings.css';

const AccountSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [feedback, setFeedback] = useState('');

  // Handle updating account settings
  const handleUpdateAccount = async () => {
    if (newPassword !== confirmPassword) {
      setFeedback('New password and confirmation do not match.');
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Assuming JWT authentication
      const data = {
        currentPassword,
        newPassword,
        email,
        phoneNumber,
      };

      const response = await axios.put('http://localhost:5002/api/user/account-settings', data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setFeedback('Account settings updated successfully!');
      } else {
        setFeedback('Failed to update account settings.');
      }
    } catch (error) {
      console.error('Error updating account settings:', error);
      setFeedback('An error occurred. Please try again.');
    }
  };

  return (
    <div className="account-settings-container">
      <h3>Account Settings</h3>
      <div className="input-group">
        <label>Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label>Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label>Update Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Update Phone Number</label>
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>

      <button className="update-button" onClick={handleUpdateAccount}>
        Save Changes
      </button>

      {feedback && <p className="feedback">{feedback}</p>}
    </div>
  );
};

export default AccountSettings;
