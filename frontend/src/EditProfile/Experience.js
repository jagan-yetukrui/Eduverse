// Import necessary dependencies
import React, { useState, useEffect, useCallback } from 'react';
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
  faSpinner,
  faExclamationCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import './Experience.css';

import { profileService, validationUtils } from '../services/profileService';

/**
 * Experience Component
 * Manages user's work experience with full CRUD operations
 */
const Experience = ({ onUpdate }) => {
  // State management
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
    is_current: false,
    employment_type: 'Full-time'
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});

  // Employment type options
  const employmentTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
    { value: 'volunteer', label: 'Volunteer' }
  ];

  /**
   * Fetch experience data on component mount
   */
  useEffect(() => {
    fetchExperienceData();
  }, []);

  /**
   * Fetch experience entries from API
   */
  const fetchExperienceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await profileService.getExperience();
      setExperiences(data);
      
    } catch (err) {
      console.error('Error fetching experience:', err);
      setError(err.message || 'Failed to load experience data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      location: '',
      start_date: '',
      end_date: '',
      description: '',
      is_current: false,
      employment_type: 'full-time'
    });
    setValidationErrors({});
    setIsAdding(false);
    setEditingId(null);
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const errors = {};
    
    if (!formData.company.trim()) {
      errors.company = 'Company is required';
    }
    
    if (!formData.position.trim()) {
      errors.position = 'Position is required';
    }
    
    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }
    
    if (!formData.is_current && !formData.end_date) {
      errors.end_date = 'End date is required unless currently working';
    }
    
    if (formData.start_date && formData.end_date && !formData.is_current) {
      if (!validationUtils.validateDateRange(formData.start_date, formData.end_date)) {
        errors.end_date = 'End date must be after start date';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  /**
   * Handle adding new experience entry
   */
  const handleAdd = async () => {
    try {
      if (!validateForm()) {
        setError('Please fix the validation errors before saving.');
        return;
      }

      setIsSaving(true);
      setError(null);
      
      const experienceData = {
        ...formData,
        end_date: formData.is_current ? null : formData.end_date
      };
      
      const newEntry = await profileService.addExperience(experienceData);
      
      setExperiences(prev => [...prev, newEntry]);
      resetForm();
      setSuccess('Experience entry added successfully!');
      
      if (onUpdate) {
        onUpdate('experience', newEntry);
      }
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error adding experience:', err);
      setError(err.message || 'Failed to add experience entry');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle updating existing experience entry
   */
  const handleUpdate = async () => {
    try {
      if (!validateForm()) {
        setError('Please fix the validation errors before saving.');
        return;
      }

      setIsSaving(true);
      setError(null);
      
      const experienceData = {
        ...formData,
        end_date: formData.is_current ? null : formData.end_date
      };
      
      const updatedEntry = await profileService.updateExperience(editingId, experienceData);
      
      setExperiences(prev => 
        prev.map(entry => entry.id === editingId ? updatedEntry : entry)
      );
      
      resetForm();
      setSuccess('Experience entry updated successfully!');
      
      if (onUpdate) {
        onUpdate('experience', updatedEntry);
      }
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error updating experience:', err);
      setError(err.message || 'Failed to update experience entry');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle deleting experience entry
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this experience entry?')) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      await profileService.deleteExperience(id);
      
      setExperiences(prev => prev.filter(entry => entry.id !== id));
      setSuccess('Experience entry deleted successfully!');
      
      if (onUpdate) {
        onUpdate('experience', { deleted: id });
      }
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error deleting experience:', err);
      setError(err.message || 'Failed to delete experience entry');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Start editing an entry
   */
  const startEditing = (entry) => {
    setFormData({
      company: entry.company || '',
      position: entry.position || '',
      location: entry.location || '',
      start_date: entry.start_date || '',
      end_date: entry.end_date || '',
      description: entry.description || '',
      is_current: !entry.end_date,
      employment_type: entry.employment_type || 'full-time'
    });
    setEditingId(entry.id);
    setIsAdding(false);
  };

  /**
   * Start adding new entry
   */
  const startAdding = () => {
    resetForm();
    setIsAdding(true);
    setEditingId(null);
  };

  /**
   * Cancel current operation
   */
  const handleCancel = () => {
    resetForm();
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner" />
        <p>Loading experience data...</p>
      </div>
    );
  }

  return (
    <div className="experience-section">
      {/* Header */}
      <div className="section-header">
        <h2>Work Experience</h2>
        <p>Manage your professional work history and achievements</p>
      </div>

      {/* Status Messages */}
      {(error || success) && (
        <div className="status-messages">
          {error && (
            <div className="message error">
              <FontAwesomeIcon icon={faExclamationCircle} />
              {error}
              <button 
                className="close-message"
                onClick={() => setError(null)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}
          
          {success && (
            <div className="message success">
              <FontAwesomeIcon icon={faCheckCircle} />
              {success}
          <button 
                className="close-message"
                onClick={() => setSuccess(null)}
          >
                <FontAwesomeIcon icon={faTimes} />
          </button>
            </div>
        )}
      </div>
      )}

      {/* Experience Entries List */}
      <div className="experience-entries">
        {experiences.length === 0 && !isAdding ? (
          <div className="empty-state">
            <p>No work experience yet. Add your first professional experience!</p>
            <button className="btn-primary" onClick={startAdding}>
              <FontAwesomeIcon icon={faPlus} />
              Add Experience
            </button>
          </div>
        ) : (
          <>
            {/* Existing Entries */}
            {experiences.map(entry => (
              <div key={entry.id} className="experience-entry">
                <div className="entry-header">
                  <div className="entry-title">
                    <h3>{entry.position}</h3>
                    <div className="company-info">
                <FontAwesomeIcon icon={faBuilding} />
                      <span>{entry.company}</span>
              </div>
              </div>
                  <div className="entry-actions">
                <button 
                      className="btn-icon"
                      onClick={() => startEditing(entry)}
                      disabled={isSaving}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button 
                      className="btn-icon danger"
                      onClick={() => handleDelete(entry.id)}
                      disabled={isSaving}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
                
                <div className="entry-details">
                  <div className="entry-meta">
                    <div className="meta-item">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <span>{entry.location || 'Remote'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="employment-type">
                        {employmentTypes.find(type => type.value === entry.employment_type)?.label || entry.employment_type}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="dates">
                        {formatDate(entry.start_date)} - {entry.is_current ? 'Present' : formatDate(entry.end_date)}
                      </span>
                    </div>
                  </div>
                  
                  {entry.description && (
                    <div className="entry-description">
                      <p>{entry.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add New Button */}
            {!isAdding && (
              <button className="btn-add" onClick={startAdding}>
                <FontAwesomeIcon icon={faPlus} />
                Add Experience
              </button>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="experience-form">
            <div className="form-header">
            <h3>{editingId ? 'Edit Experience' : 'Add Experience'}</h3>
            <button className="btn-icon" onClick={handleCancel}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

          <div className="form-content">
            <div className="form-row">
            <div className="form-group">
                <label htmlFor="company">
                  Company *
                  {validationErrors.company && (
                    <span className="error-text">{validationErrors.company}</span>
                  )}
                </label>
              <input
                  id="company"
                  name="company"
                type="text"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Company name"
                  className={validationErrors.company ? 'error' : ''}
              />
            </div>

            <div className="form-group">
                <label htmlFor="position">
                  Position *
                  {validationErrors.position && (
                    <span className="error-text">{validationErrors.position}</span>
                  )}
                </label>
              <input
                  id="position"
                  name="position"
                type="text"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="Job title"
                  className={validationErrors.position ? 'error' : ''}
              />
              </div>
            </div>

            <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                  id="location"
                  name="location"
                type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country or Remote"
                />
              </div>

              <div className="form-group">
                <label htmlFor="employment_type">Employment Type</label>
                <select
                  id="employment_type"
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleInputChange}
                >
                  {employmentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">
                  Start Date *
                  {validationErrors.start_date && (
                    <span className="error-text">{validationErrors.start_date}</span>
                  )}
                </label>
                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className={validationErrors.start_date ? 'error' : ''}
                />
              </div>

              <div className="form-group">
                <label htmlFor="end_date">
                  End Date
                  {validationErrors.end_date && (
                    <span className="error-text">{validationErrors.end_date}</span>
                  )}
                </label>
                <input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  disabled={formData.is_current}
                  className={validationErrors.end_date ? 'error' : ''}
                />
            </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                <input
                    name="is_current"
                  type="checkbox"
                    checked={formData.is_current}
                    onChange={handleInputChange}
                />
                I currently work here
              </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your role, responsibilities, achievements, and technologies used..."
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button 
                className="btn-secondary"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={editingId ? handleUpdate : handleAdd}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                    Saving...
                  </>
                ) : (
                  <>
                  <FontAwesomeIcon icon={faCheck} />
                    {editingId ? 'Update' : 'Add'} Experience
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Experience;
