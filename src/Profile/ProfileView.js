import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ProfileView.css';

const ProfileView = () => {
  const { email } = useParams(); // Fetch email from the URL
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/profile/${email}`);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(null);
      }
    };
    fetchUserProfile();
  }, [email]);

  if (!userData) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <h2>{userData.name}'s Profile</h2>
      <p><strong>Email:</strong> {userData.email}</p>
      <p><strong>Bio:</strong> {userData.bio}</p>
      <p><strong>Education:</strong> {userData.education}</p>
      <p><strong>Work Experience:</strong> {userData.work_experience}</p>
      <p><strong>Skills:</strong> {userData.skills.join(', ')}</p>
      <p><strong>Projects:</strong> {userData.projects.join(', ')}</p>
      <p><strong>Certifications:</strong> {userData.certifications.join(', ')}</p>
      <p><strong>Publications:</strong> {userData.publications.join(', ')}</p>
      <p><strong>LinkedIn:</strong> <a href={userData.linkedin}>{userData.linkedin}</a></p>
      <p><strong>GitHub:</strong> <a href={userData.github}>{userData.github}</a></p>
    </div>
  );
};

export default ProfileView;
