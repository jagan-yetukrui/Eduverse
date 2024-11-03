import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProfileView.css';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProfileView = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      // If no token, redirect to login page
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5002/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Profile data fetched:', response.data);
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Could not fetch profile data. Please login again.');
        localStorage.removeItem('access_token');  // Clear token if invalid
        navigate('/login');  // Redirect to login page
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>No user data available.</div>;
  }

  // Navigation to Profile Edit and Settings
  const handleEditProfileClick = () => {
    navigate('/profile/edit');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <div className="profile-view-container">
      <div className="profile-header">
        <img
          className="profile-avatar"
          src="https://via.placeholder.com/150"
          alt="Profile Avatar"
        />
        <div className="profile-details">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-username">@{user.email}</p>
          <p className="profile-bio">{user.bio || 'No bio provided'}</p>

          <div className="profile-social-links">
            {user.linkedin && (
              <a href={user.linkedin} target="_blank" rel="noopener noreferrer">
                <FaLinkedin className="social-icon" />
              </a>
            )}
            {user.github && (
              <a href={user.github} target="_blank" rel="noopener noreferrer">
                <FaGithub className="social-icon" />
              </a>
            )}
          </div>

          <div className="profile-actions">
            <button className="profile-edit-button" onClick={handleEditProfileClick}>
              Edit Profile
            </button>
            <button className="settings-button" onClick={handleSettingsClick}>
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h2 className="section-title">Education</h2>
        <div className="education-item">
          <p>{user.education || 'Not provided'}</p>
        </div>
      </div>

      <div className="profile-section">
        <h2 className="section-title">Work Experience</h2>
        <div className="experience-item">
          <p>{user.work_experience || 'Not provided'}</p>
        </div>
      </div>

      <div className="profile-section">
        <h2 className="section-title">Skills</h2>
        <div className="skills-container">
          {user.skills && user.skills.length > 0 ? (
            user.skills.map((skill, index) => (
              <span key={index} className="skill-badge">{skill}</span>
            ))
          ) : (
            <p>No skills provided</p>
          )}
        </div>
      </div>

      <div className="scroll-down">
        <p>Scroll for more</p>
        <div className="scroll-icon">⬇️</div>
      </div>
    </div>
  );
};

export default ProfileView;
