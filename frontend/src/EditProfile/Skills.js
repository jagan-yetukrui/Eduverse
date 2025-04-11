import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Skills.css';

/**
 * Skills component for managing user's professional skills
 * Allows users to view, add and remove skills from their profile
 */
const Skills = () => {
  // State management for skills list and form handling
  const [skills, setSkills] = useState([]); // Array of user's skills
  const [newSkill, setNewSkill] = useState(''); // Input field for new skill
  const [error, setError] = useState(''); // Error message state
  const [successMessage, setSuccessMessage] = useState(''); // Success message state
  const [isLoading, setIsLoading] = useState(false); // Loading state for API operations

  // Fetch skills when component mounts
  useEffect(() => {
    fetchSkills();
  }, []);

  /**
   * Fetches user's skills from the backend API
   * Updates skills state with the response data
   */
  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profiles/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSkills(response.data.skills || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setError('Failed to load skills. Please try again.');
    }
  };

  /**
   * Handles the addition of a new skill
   * Validates input and makes API call to add skill
   * @param {Event} e - Form submission event
   */
  const handleAddSkill = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
  
    // Input validation
    if (!newSkill.trim()) {
      setError('Please enter a skill.');
      setIsLoading(false);
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/profiles/add-skill/',
        { skill: newSkill.trim() },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      // Update state on successful addition
      setSkills(response.data.skills);
      setNewSkill('');
      setSuccessMessage('Skill added successfully!');
    } catch (error) {
      console.error('Error adding skill:', error);
      // Handle error messages from backend
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to add skill. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the deletion of a skill
   * Makes API call to remove skill from user's profile
   * @param {string} skillToDelete - The skill to be removed
   */
  const handleDeleteSkill = async (skillToDelete) => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/profiles/remove-skill/',
        { skill: skillToDelete },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update skills list after successful deletion
      setSkills(response.data.skills);
      setSuccessMessage('Skill removed successfully!');
    } catch (error) {
      console.error('Error deleting skill:', error);
      // Handle error messages from backend
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to remove skill. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="skills-container">
      <h2>Skills</h2>

      {/* Form for adding new skills */}
      <form onSubmit={handleAddSkill}>
        <div className="input-group">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Enter a skill"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="add-button"
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Skill'}
          </button>
        </div>
        {/* Error and success message display */}
        {error && <p className="error-text">{error}</p>}
        {successMessage && <p className="success-text">{successMessage}</p>}
      </form>

      {/* Skills list display */}
      <div className="skills-list">
        {skills.length === 0 ? (
          <p>No skills added yet.</p>
        ) : (
          skills.map((skill, index) => (
            <div key={index} className="skill-item">
              <span>{skill}</span>
              <button
                className="delete-button"
                onClick={() => handleDeleteSkill(skill)}
                disabled={isLoading}
              >
                {isLoading ? 'Removing...' : 'Delete'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Skills;
