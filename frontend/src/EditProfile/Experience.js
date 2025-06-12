// Import necessary dependencies
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBriefcase, 
  faBuilding, 
  faMapMarkerAlt, 
  faCalendarAlt,
  faPlus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import './Experience.css';

/**
 * Experience component for managing user's professional experience
 * Allows users to view, add, edit and delete work experiences from their profile
 * @param {Array} experiences - Array of existing experience entries
 * @param {Function} onUpdate - Callback function to update experiences
 */
const Experience = ({ experiences, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [experience, setExperience] = useState({
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: ''
  });

  /**
   * Handles form submission for adding new experience
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(experience);
      resetForm();
      setIsAdding(false);
    } catch (error) {
      console.error('Error submitting experience:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setExperience(experiences[index]);
  };

  const handleDelete = async (index) => {
    try {
      await onUpdate({ ...experiences[index], _delete: true });
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  const resetForm = () => {
    setExperience({
      title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: ''
    });
    setEditingIndex(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="experience-container">
      <div className="experience-header">
        <h2>
          <FontAwesomeIcon icon={faBriefcase} className="header-icon" />
          Experience
        </h2>
        {!isAdding && (
          <button 
            className="add-experience-btn"
            onClick={() => setIsAdding(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Experience
          </button>
        )}
      </div>

      {/* Experience List */}
      <div className="experience-list">
        {experiences.map((exp, index) => (
          <div key={index} className="experience-card">
            <div className="experience-header">
              <div className="company-logo">
                <FontAwesomeIcon icon={faBuilding} />
              </div>
              <div className="experience-info">
                <h3>{exp.title}</h3>
                <p className="company">{exp.company}</p>
                <p className="location">
                  <FontAwesomeIcon icon={faMapMarkerAlt} /> {exp.location}
                </p>
                <p className="date">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                </p>
              </div>
              <div className="experience-actions">
                <button 
                  className="edit-btn"
                  onClick={() => handleEdit(index)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(index)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
            {exp.description && (
              <div className="experience-description">
                <p>{exp.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Experience Form */}
      {(isAdding || editingIndex !== null) && (
        <div className="experience-form-container">
          <form onSubmit={handleSubmit} className="experience-form">
            <div className="form-header">
              <h3>{editingIndex !== null ? 'Edit Experience' : 'Add Experience'}</h3>
              <button 
                type="button" 
                className="close-btn"
                onClick={() => {
                  setIsAdding(false);
                  resetForm();
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={experience.title}
                onChange={(e) => setExperience({...experience, title: e.target.value})}
                placeholder="e.g. Software Engineer"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                value={experience.company}
                onChange={(e) => setExperience({...experience, company: e.target.value})}
                placeholder="e.g. Google"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                value={experience.location}
                onChange={(e) => setExperience({...experience, location: e.target.value})}
                placeholder="e.g. San Francisco, CA"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">Start Date</label>
                <input
                  type="date"
                  id="start_date"
                  value={experience.start_date}
                  onChange={(e) => setExperience({...experience, start_date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="end_date">End Date</label>
                <input
                  type="date"
                  id="end_date"
                  value={experience.end_date}
                  onChange={(e) => setExperience({...experience, end_date: e.target.value})}
                  disabled={experience.is_current}
                />
              </div>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={experience.is_current}
                  onChange={(e) => setExperience({...experience, is_current: e.target.checked})}
                />
                I currently work here
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={experience.description}
                onChange={(e) => setExperience({...experience, description: e.target.value})}
                placeholder="Describe your responsibilities and achievements"
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setIsAdding(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faCheck} />
                )}
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Experience;
