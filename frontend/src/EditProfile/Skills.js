import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Skills.css';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  // Function to fetch existing skills from the backend
  const fetchSkills = async () => {
    try {
      const response = await axios.get('/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSkills(response.data.skills || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
  
    if (!newSkill.trim()) {
      setError('Please enter a skill.');
      return;
    }
  
    try {
      const response = await axios.post(
        '/add_skill',
        { skill: newSkill },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
  
      // Update the skills list on success
      setSkills(response.data.skills);
      setNewSkill('');
      setSuccessMessage('Skill added successfully!');
    } catch (error) {
      console.error('Error adding skill:', error);
  
      // Capture specific backend error messages if available
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('An error occurred while adding the skill. Please try again.');
      }
    }
  };
  

  const handleDeleteSkill = async (skillToDelete) => {
    try {
      // Replace with your delete endpoint if available
      setSkills(skills.filter(skill => skill !== skillToDelete));
      setSuccessMessage('Skill removed successfully!');
    } catch (error) {
      console.error('Error deleting skill:', error);
      setError('An error occurred while deleting the skill. Please try again.');
    }
  };

  return (
    <div className="skills-container">
      <h2>Skills</h2>

      <form onSubmit={handleAddSkill}>
        <div className="input-group">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Enter a skill"
          />
          <button type="submit" className="add-button">Add Skill</button>
        </div>
        {error && <p className="error-text">{error}</p>}
        {successMessage && <p className="success-text">{successMessage}</p>}
      </form>

      <div className="skills-list">
        {skills.map((skill, index) => (
          <div key={index} className="skill-item">
            <span>{skill}</span>
            <button
              className="delete-button"
              onClick={() => handleDeleteSkill(skill)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skills;
