import React, { useState } from 'react';
import Experience from './Experience';
import Education from './Education';
import Licenses from './Licenses';
import Projects from './Projects';
import Skills from './Skills'; // Import Skills
import './EditProfile.css';

const EditProfile = () => {
  const [activeSection, setActiveSection] = useState(null);

  const handleOpenModal = (section) => {
    setActiveSection(section);
  };

  const handleCloseModal = () => {
    setActiveSection(null);
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <nav className="edit-profile-nav">
        <ul>
          <li onClick={() => handleOpenModal('experience')}>Experience</li>
          <li onClick={() => handleOpenModal('education')}>Education</li>
          <li onClick={() => handleOpenModal('skills')}>Skills</li>
          <li onClick={() => handleOpenModal('licenses')}>Licenses/Certifications</li>
          <li onClick={() => handleOpenModal('projects')}>Projects/Research</li>
        </ul>
      </nav>

      {activeSection === 'experience' && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>X</button>
            <Experience />
          </div>
        </div>
      )}

      {activeSection === 'education' && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>X</button>
            <Education />
          </div>
        </div>
      )}

      {activeSection === 'skills' && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>X</button>
            <Skills />
          </div>
        </div>
      )}

      {activeSection === 'licenses' && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>X</button>
            <Licenses />
          </div>
        </div>
      )}

      {activeSection === 'projects' && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>X</button>
            <Projects />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
