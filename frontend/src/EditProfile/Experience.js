import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Experience.css';

/**
 * Experience component for managing user's professional experience
 * Allows users to view, add, edit and delete work experiences from their profile
 */
const Experience = () => {
  // State management
  const [experiences, setExperiences] = useState([]); // Array of user's experiences
  const [error, setError] = useState(''); // Error message state
  const [successMessage, setSuccessMessage] = useState(''); // Success message state
  const [isLoading, setIsLoading] = useState(false); // Loading state for API operations

  // Fetch experiences when component mounts
  useEffect(() => {
    fetchExperiences();
  }, []);

  /**
   * Fetches user's experiences from the backend API
   */
  const fetchExperiences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profiles/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExperiences(response.data.experiences || [{
        company_name: '',
        location: '',
        work_mode: '',
        start_date: '',
        end_date: '',
        currently_working: false,
      }]);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      setError('Failed to load experiences. Please try again.');
    }
  };

  /**
   * Handles input changes in the experience form
   * @param {number} index - Index of experience being edited
   * @param {Event} event - Input change event
   */
  const handleChange = (index, event) => {
    const { name, value, type, checked } = event.target;
    const updatedExperiences = [...experiences];
    updatedExperiences[index][name] = type === 'checkbox' ? checked : value;
    setExperiences(updatedExperiences);
    setError('');
    setSuccessMessage('');
  };

  /**
   * Adds a new empty experience form
   */
  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        company_name: '',
        location: '',
        work_mode: '',
        start_date: '',
        end_date: '',
        currently_working: false,
      },
    ]);
  };

  /**
   * Removes an experience at specified index
   * @param {number} index - Index of experience to remove
   */
  const handleDeleteExperience = async (index) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const experienceId = experiences[index].id;
      
      if (experienceId) {
        await axios.delete(`/api/profiles/delete-experience/${experienceId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      const updatedExperiences = experiences.filter((_, i) => i !== index);
      setExperiences(updatedExperiences);
      setSuccessMessage('Experience deleted successfully');
    } catch (error) {
      console.error('Error deleting experience:', error);
      setError('Failed to delete experience. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles form submission
   * Validates and sends data to backend
   * @param {Event} event - Form submission event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/profiles/update-experiences/', 
        { experiences },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setSuccessMessage('Experiences updated successfully');
    } catch (error) {
      console.error('Error updating experiences:', error);
      setError('Failed to update experiences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="experience-container">
      <h2>Professional Experience</h2>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      
      <form onSubmit={handleSubmit}>
        {experiences.map((experience, index) => (
          <div key={index} className="experience-item">
            <div className="input-group">
              <label>Company Name</label>
              <input
                type="text"
                name="company_name"
                value={experience.company_name}
                onChange={(e) => handleChange(index, e)}
                placeholder="Company Name"
                required
              />
            </div>
            <div className="input-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={experience.location}
                onChange={(e) => handleChange(index, e)}
                placeholder="Location"
                required
              />
            </div>
            <div className="input-group">
              <label>Work Mode</label>
              <select
                name="work_mode"
                value={experience.work_mode}
                onChange={(e) => handleChange(index, e)}
                required
              >
                <option value="">Select...</option>
                <option value="on-site">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div className="input-group">
              <label>Start Date</label>
              <input
                type="date"
                name="start_date"
                value={experience.start_date}
                onChange={(e) => handleChange(index, e)}
                required
              />
            </div>
            <div className="input-group">
              <label>
                <input
                  type="checkbox"
                  name="currently_working"
                  checked={experience.currently_working}
                  onChange={(e) => handleChange(index, e)}
                />
                Currently Working Here
              </label>
            </div>
            {!experience.currently_working && (
              <div className="input-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={experience.end_date}
                  onChange={(e) => handleChange(index, e)}
                  min={experience.start_date}
                  required
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => handleDeleteExperience(index)}
              className="delete-button"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddExperience}
          className="add-button"
          disabled={isLoading}
        >
          Add Experience
        </button>
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Experiences'}
        </button>
      </form>
    </div>
  );
};

export default Experience;
