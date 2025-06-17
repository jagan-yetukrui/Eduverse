import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Skills.css';

/**
 * Skills component for managing user's professional skills
 * Allows users to view, add and remove skills from their profile
 */
const Skills = ({ skills: initialSkills, onUpdate }) => {
  const [skills, setSkills] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with passed skills data
  useEffect(() => {
    if (initialSkills) {
      setSkills(initialSkills);
    }
  }, [initialSkills]);

  /**
   * Note: Skills are managed by AI according to the backend,
   * so we'll only implement viewing functionality
   */
  
  return (
    <div className="skills-container">
      <h2>Skills</h2>
      <div className="skills-info">
        <p className="info-text">
          Your skills are automatically analyzed and updated based on your profile information,
          education, and experience.
        </p>
      </div>

      {/* Display skills by category */}
      <div className="skills-list">
        {Object.entries(skills).map(([category, categorySkills]) => (
          <div key={category} className="skill-category">
            <h3>{category}</h3>
            <div className="category-skills">
              {categorySkills.map((skill, index) => (
                <div key={index} className="skill-item">
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Show message if no skills are present */}
      {Object.keys(skills).length === 0 && (
        <p className="no-skills">
          Your skills will be automatically generated based on your profile information.
          Please complete your education and experience sections.
        </p>
      )}
    </div>
  );
};

export default Skills;
