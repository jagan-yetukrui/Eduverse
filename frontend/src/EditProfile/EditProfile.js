import React, { useState, useEffect } from 'react';
import Experience from './Experience';
import Education from './Education';
import Licenses from './Licenses';
import Projects from './Projects';
import Skills from './Skills';
import './EditProfile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faGraduationCap, faLightbulb, faCertificate, faProjectDiagram, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

/**
 * EditProfile component that serves as the main profile editing interface
 * Provides navigation between different sections of the profile (Experience, Education, etc.)
 * Implements a responsive sidebar navigation that collapses on mobile
 */
const EditProfile = () => {
  // State to track which section is currently active
  const [activeSection, setActiveSection] = useState(null);
  // State to track any errors that occur
  const [error, setError] = useState(null);

  // Verify user authentication on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Verify token with backend
        await axios.get('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        setError('Authentication failed. Please login again.');
        // Redirect to login page or handle auth error
      }
    };

    verifyAuth();
  }, []);

  /**
   * Opens the selected section in the sidebar
   * @param {string} section - Name of section to open
   */
  const handleOpenModal = (section) => {
    setActiveSection(section);
  };

  /**
   * Closes the active section
   */
  const handleCloseModal = () => {
    setActiveSection(null);
  };

  return (
    <div className={`edit-profile-container ${activeSection ? 'sidebar-active' : ''}`}>
      {/* Navigation sidebar */}
      <nav className={`edit-profile-nav ${activeSection ? 'sidebar' : ''}`}>
        {activeSection && (
          <div className="back-button" onClick={handleCloseModal}>
            <FontAwesomeIcon icon={faArrowLeft} className="icon" />
            <span>Back</span>
          </div>
        )}
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

      {/* Content area */}
      <div className="edit-profile-content">
        {activeSection === 'experience' && <Experience />}
        {activeSection === 'education' && <Education />}
        {activeSection === 'skills' && <Skills />}
        {activeSection === 'licenses' && <Licenses />}
        {activeSection === 'projects' && <Projects />}
      </div>
    </div>
  );
};

export default EditProfile;
