import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faSave, 
  faTimes, 
  faSpinner,
  faExclamationCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

import { profileService, validationUtils } from '../services/profileService';
import './Education.css';

/**
 * Education Component
 * Manages user's educational history with full CRUD operations
 */
const Education = ({ onUpdate }) => {
  // State management
  const [educationEntries, setEducationEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    gpa: '',
    description: '',
    is_current: false
  });
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({});

  // Degree options
  const degreeOptions = [
    'High School Diploma',
    'Associate of Arts (A.A.)',
    'Associate of Science (A.S.)', 
    'Associate of Applied Science (A.A.S.)',
    'Bachelor of Arts (B.A.)',
    'Bachelor of Science (B.S.)',
    'Bachelor of Fine Arts (B.F.A.)',
    'Bachelor of Business Administration (B.B.A.)',
    'Bachelor of Engineering (B.E.)',
    'Master of Arts (M.A.)',
    'Master of Science (M.S.)',
    'Master of Business Administration (M.B.A.)',
    'Master of Engineering (M.Eng.)',
    'Master of Fine Arts (M.F.A.)',
    'Master of Public Health (M.P.H.)',
    'Doctor of Philosophy (Ph.D.)',
    'Doctor of Education (Ed.D.)',
    'Doctor of Business Administration (D.B.A.)',
    'Juris Doctor (J.D.)',
    'Doctor of Medicine (M.D.)',
    'Doctor of Dental Surgery (D.D.S.)',
    'Certificate',
    'Diploma',
    'Other'
  ];

  // Field of study options
  const fieldOptions = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Data Science',
    'Artificial Intelligence',
    'Machine Learning',
    'Cybersecurity',
    'Web Development',
    'Mobile Development',
    'Game Development',
    'Computer Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Biomedical Engineering',
    'Business Administration',
    'Finance',
    'Marketing',
    'Accounting',
    'Economics',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Psychology',
    'Sociology',
    'Political Science',
    'History',
    'English Literature',
    'Philosophy',
    'Art',
    'Music',
    'Theater',
    'Film',
    'Journalism',
    'Communications',
    'Education',
    'Nursing',
    'Medicine',
    'Law',
    'Architecture',
    'Design',
    'Other'
  ];

  /**
   * Fetch education data on component mount
   */
  useEffect(() => {
    fetchEducationData();
  }, []);

  /**
   * Fetch education entries from API
   */
  const fetchEducationData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await profileService.getEducation();
      setEducationEntries(data);
      
    } catch (err) {
      console.error('Error fetching education:', err);
      setError(err.message || 'Failed to load education data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      institution: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      gpa: '',
      description: '',
      is_current: false
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
    
    if (!formData.institution.trim()) {
      errors.institution = 'Institution is required';
    }
    
    if (!formData.degree.trim()) {
      errors.degree = 'Degree is required';
    }
    
    if (!formData.field_of_study.trim()) {
      errors.field_of_study = 'Field of study is required';
    }
    
    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }
    
    if (!formData.is_current && !formData.end_date) {
      errors.end_date = 'End date is required unless currently studying';
    }
    
    if (formData.start_date && formData.end_date && !formData.is_current) {
      if (!validationUtils.validateDateRange(formData.start_date, formData.end_date)) {
        errors.end_date = 'End date must be after start date';
      }
    }
    
    if (formData.gpa && (formData.gpa < 0 || formData.gpa > 4.0)) {
      errors.gpa = 'GPA must be between 0 and 4.0';
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
   * Handle adding new education entry
   */
  const handleAdd = async () => {
    try {
      if (!validateForm()) {
        setError('Please fix the validation errors before saving.');
        return;
      }

      setIsSaving(true);
      setError(null);
      
      const educationData = {
        ...formData,
        end_date: formData.is_current ? null : formData.end_date,
        gpa: formData.gpa || null
      };
      
      const newEntry = await profileService.addEducation(educationData);
      
      setEducationEntries(prev => [...prev, newEntry]);
      resetForm();
      setSuccess('Education entry added successfully!');
      
      if (onUpdate) {
        onUpdate('education', newEntry);
      }
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error adding education:', err);
      setError(err.message || 'Failed to add education entry');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle updating existing education entry
   */
  const handleUpdate = async () => {
    try {
      if (!validateForm()) {
        setError('Please fix the validation errors before saving.');
        return;
      }

      setIsSaving(true);
      setError(null);
      
      const educationData = {
        ...formData,
        end_date: formData.is_current ? null : formData.end_date,
        gpa: formData.gpa || null
      };
      
      const updatedEntry = await profileService.updateEducation(editingId, educationData);
      
      setEducationEntries(prev => 
        prev.map(entry => entry.id === editingId ? updatedEntry : entry)
      );
      
      resetForm();
      setSuccess('Education entry updated successfully!');
      
      if (onUpdate) {
        onUpdate('education', updatedEntry);
      }
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error updating education:', err);
      setError(err.message || 'Failed to update education entry');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle deleting education entry
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this education entry?')) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      await profileService.deleteEducation(id);
      
      setEducationEntries(prev => prev.filter(entry => entry.id !== id));
      setSuccess('Education entry deleted successfully!');
      
      if (onUpdate) {
        onUpdate('education', { deleted: id });
      }
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error deleting education:', err);
      setError(err.message || 'Failed to delete education entry');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Start editing an entry
   */
  const startEditing = (entry) => {
    setFormData({
      institution: entry.institution || '',
      degree: entry.degree || '',
      field_of_study: entry.field_of_study || '',
      start_date: entry.start_date || '',
      end_date: entry.end_date || '',
      gpa: entry.gpa || '',
      description: entry.description || '',
      is_current: !entry.end_date
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

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner" />
        <p>Loading education data...</p>
      </div>
    );
  }

  return (
    <div className="education-section">
      {/* Header */}
      <div className="section-header">
        <h2>Education</h2>
        <p>Manage your educational background and qualifications</p>
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
      
      {/* Education Entries List */}
      <div className="education-entries">
        {educationEntries.length === 0 && !isAdding ? (
          <div className="empty-state">
            <p>No education entries yet. Add your first educational experience!</p>
            <button className="btn-primary" onClick={startAdding}>
              <FontAwesomeIcon icon={faPlus} />
              Add Education
            </button>
          </div>
        ) : (
          <>
            {/* Existing Entries */}
            {educationEntries.map(entry => (
              <div key={entry.id} className="education-entry">
                <div className="entry-header">
                  <h3>{entry.institution}</h3>
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
                  <p className="degree">
                    {entry.degree} in {entry.field_of_study}
                  </p>
                  <p className="dates">
                    {entry.start_date} - {entry.is_current ? 'Present' : entry.end_date}
                  </p>
                  {entry.gpa && (
                    <p className="gpa">GPA: {entry.gpa}</p>
                  )}
                  {entry.description && (
                    <p className="description">{entry.description}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Add New Button */}
            {!isAdding && (
              <button className="btn-add" onClick={startAdding}>
                <FontAwesomeIcon icon={faPlus} />
                Add Education
              </button>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="education-form">
          <div className="form-header">
            <h3>{editingId ? 'Edit Education' : 'Add Education'}</h3>
            <button className="btn-icon" onClick={handleCancel}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="form-content">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="institution">
                  Institution *
                  {validationErrors.institution && (
                    <span className="error-text">{validationErrors.institution}</span>
                  )}
                </label>
              <input
                  id="institution"
                  name="institution"
                type="text"
                  value={formData.institution}
                  onChange={handleInputChange}
                  placeholder="University/College name"
                  className={validationErrors.institution ? 'error' : ''}
              />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="degree">
                  Degree *
                  {validationErrors.degree && (
                    <span className="error-text">{validationErrors.degree}</span>
                  )}
                </label>
              <select
                  id="degree"
                name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  className={validationErrors.degree ? 'error' : ''}
              >
                <option value="">Select degree</option>
                  {degreeOptions.map(degree => (
                    <option key={degree} value={degree}>{degree}</option>
                ))}
              </select>
            </div>

              <div className="form-group">
                <label htmlFor="field_of_study">
                  Field of Study *
                  {validationErrors.field_of_study && (
                    <span className="error-text">{validationErrors.field_of_study}</span>
                  )}
                </label>
              <select
                  id="field_of_study"
                  name="field_of_study"
                  value={formData.field_of_study}
                  onChange={handleInputChange}
                  className={validationErrors.field_of_study ? 'error' : ''}
              >
                  <option value="">Select field</option>
                  {fieldOptions.map(field => (
                    <option key={field} value={field}>{field}</option>
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
                  Currently studying here
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gpa">
                  GPA
                  {validationErrors.gpa && (
                    <span className="error-text">{validationErrors.gpa}</span>
                  )}
                </label>
              <input
                  id="gpa"
                  name="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={formData.gpa}
                  onChange={handleInputChange}
                  placeholder="e.g., 3.8"
                  className={validationErrors.gpa ? 'error' : ''}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your studies, achievements, or relevant coursework..."
                rows={3}
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
                    <FontAwesomeIcon icon={faSave} />
                    {editingId ? 'Update' : 'Add'} Education
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

export default Education;
