import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfilePrivacy = () => {
  const [profilePrivacy, setProfilePrivacy] = useState('public'); // public or private
  const [feedback, setFeedback] = useState('');

  // Fetch current profile privacy setting from the backend
  useEffect(() => {
    const fetchPrivacySettings = async () => {
      try {
        const token = localStorage.getItem('token');  // Assuming you use JWT authentication
        const response = await axios.get('http://localhost:5002/api/user/profile-privacy', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfilePrivacy(response.data.profilePrivacy);
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
        setFeedback('Failed to load privacy settings.');
      }
    };
    fetchPrivacySettings();
  }, []);

  // Handle saving the updated privacy settings
  const handleSavePrivacy = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/user/profile-privacy', { profilePrivacy }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedback('Privacy settings updated successfully!');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      setFeedback('Failed to update privacy settings.');
    }
  };

  return (
    <div className="settings-section">
      <h3>Profile Privacy</h3>
      <div className="input-group">
        <label>Profile visibility:</label>
        <select
          value={profilePrivacy}
          onChange={(e) => setProfilePrivacy(e.target.value)}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>
      <button className="save-button" onClick={handleSavePrivacy}>
        Save Privacy Settings
      </button>
      {feedback && <p className="feedback">{feedback}</p>}
    </div>
  );
};

export default ProfilePrivacy;
