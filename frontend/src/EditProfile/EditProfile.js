import React, { useState } from 'react';
import Experience from './Experience';
import Education from './Education';
import Licenses from './Licenses';
import Projects from './Projects';
import Skills from './Skills'; // Import Skills
import './EditProfile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faGraduationCap, faLightbulb, faCertificate, faProjectDiagram, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const EditProfile = () => {
  const [activeSection, setActiveSection] = useState(null);

  const handleOpenModal = (section) => {
    setActiveSection(section);
  };

  const handleCloseModal = () => {
    setActiveSection(null);
  };

  return (
    <div className={`edit-profile-container ${activeSection ? 'sidebar-active' : ''}`}>
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
