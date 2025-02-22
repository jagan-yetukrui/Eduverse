// Import necessary React hooks and components
import React, { useState, useEffect } from 'react';
import Experience from './Experience';
import Education from './Education';
import Licenses from './Licenses';
import Projects from './Projects';
import Skills from './Skills';
import './EditProfile.css';

// Import FontAwesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faGraduationCap, faLightbulb, faCertificate, faProjectDiagram, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// Import axios for API calls
import axios from 'axios';

/**
 * EditProfile component that serves as the main profile editing interface
 * Provides navigation between different sections of the profile (Experience, Education, etc.)
 * Implements a responsive sidebar navigation that collapses on mobile
 * Manages state for active section, errors, success messages and profile data
 * Handles API calls to fetch and update profile information
 */
const EditProfile = () => {
  // State to track which section is currently active
  const [activeSection, setActiveSection] = useState(null);
  // State to track any errors that occur
  const [error, setError] = useState(null);
  // State to track success message
  const [successMessage, setSuccessMessage] = useState(null);

  // State object containing all profile data fields
  const [profileData, setProfileData] = useState({
    display_name: '',
    bio: '',
    website: '',
    location: '',
    education_details: [],
    experiences: [],
    licenses: [],
    skills: {},
  });

  // Effect hook to fetch profile data when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Get authentication token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Fetch user's profile details using the /api/profiles/me endpoint
        const response = await axios.get('/api/profiles/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update profile data state with fetched data
        setProfileData(response.data);
        
      } catch (err) {
        // Handle error and show message to user
        setError('Failed to load profile data. Please try again.');
        setTimeout(() => setError(null), 3000);
      }
    };

    fetchProfileData();
  }, []);

  /**
   * Opens the selected section in the sidebar
   * @param {string} section - Name of section to open (experience, education, etc.)
   */
  const handleOpenModal = (section) => {
    setActiveSection(section);
  };

  /**
   * Closes the active section and returns to main view
   */
  const handleCloseModal = () => {
    setActiveSection(null);
  };

  /**
   * Handles saving the entire profile data to the backend
   * Uses PATCH method to update only changed fields
   */
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      // Use the PATCH endpoint to update profile
      await axios.patch('/api/profiles/me/', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Show success message temporarily
      setSuccessMessage('Profile saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      // Show error message temporarily
      setError('Failed to save profile. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  /**
   * Handles updates from child components (Experience, Education, etc.)
   * Makes API call to update specific section and updates local state
   * @param {string} section - Section being updated (experience, education, etc.)
   * @param {Object} data - Updated data for the section
   */
  const handleSectionUpdate = async (section, data) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = `/api/profiles/me/${section}/`;
      
      // Make API call to update section
      await axios.post(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state based on whether section data is an array or object
      setProfileData(prev => ({
        ...prev,
        [section]: Array.isArray(prev[section]) 
          ? [...prev[section], data]
          : data
      }));

      // Show success message temporarily
      setSuccessMessage(`${section} updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      // Show error message temporarily
      setError(`Failed to update ${section}. Please try again.`);
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className={`edit-profile-container ${activeSection ? 'sidebar-active' : ''}`}>
      {/* Navigation sidebar with section links */}
      <nav className={`edit-profile-nav ${activeSection ? 'sidebar' : ''}`}>
        {/* Back button shown only when a section is active */}
        {activeSection && (
          <div className="back-button" onClick={handleCloseModal}>
            <FontAwesomeIcon icon={faArrowLeft} className="icon" />
            <span>Back</span>
          </div>
        )}
        {/* Navigation items with icons */}
        <div className="nav-item" onClick={() => handleOpenModal('experience')}>
          <FontAwesomeIcon icon={faBriefcase} className="icon" />
          <span>Experience</span>
        </div>
        <div className="nav-item" onClick={() => handleOpenModal('education')}>
          <FontAwesomeIcon icon={faGraduationCap} className="icon" />
          <span>Education</span>
        </div>
        <div className="nav-item" onClick={() => handleOpenModal('skills')}>
          <FontAwesomeIcon icon={faLightbulb} className="icon" />
          <span>Skills</span>
        </div>
        <div className="nav-item" onClick={() => handleOpenModal('licenses')}>
          <FontAwesomeIcon icon={faCertificate} className="icon" />
          <span>Licenses/Certifications</span>
        </div>
        <div className="nav-item" onClick={() => handleOpenModal('projects')}>
          <FontAwesomeIcon icon={faProjectDiagram} className="icon" />
          <span>Projects/Research</span>
        </div>
      </nav>

      {/* Error message display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Success message display */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Main content area showing active section */}
      <div className="edit-profile-content">
        {/* Render Experience section when active */}
        {activeSection === 'experience' && (
          <Experience 
            experiences={profileData.experiences}
            onUpdate={(data) => handleSectionUpdate('experience', data)}
          />
        )}
        {/* Render Education section when active */}
        {activeSection === 'education' && (
          <Education 
            education={profileData.education_details}
            onUpdate={(data) => handleSectionUpdate('education', data)}
          />
        )}
        {/* Render Skills section when active */}
        {activeSection === 'skills' && (
          <Skills 
            skills={profileData.skills}
            onUpdate={(data) => handleSectionUpdate('skills', data)}
          />
        )}
        {/* Render Licenses section when active */}
        {activeSection === 'licenses' && (
          <Licenses 
            licenses={profileData.licenses}
            onUpdate={(data) => handleSectionUpdate('licenses', data)}
          />
        )}
        {/* Render Projects section when active */}
        {activeSection === 'projects' && (
          <Projects 
            projects={profileData.projects}
            onUpdate={(data) => handleSectionUpdate('projects', data)}
          />
        )}
        
        {/* Save Profile Button */}
        <button 
          className="save-profile-button"
          onClick={handleSaveProfile}
        >
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
