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
  faCheckCircle,
  faCertificate,
  faCalendarAlt,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';

import { profileService, validationUtils } from '../services/profileService';
import './Licenses.css';

/**
 * Licenses Component
 * Manages user's professional licenses and certifications
 */
const Licenses = ({ onUpdate }) => {
  // State management
  const [licenses, setLicenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    issuing_organization: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    credential_url: '',
    description: '',
    is_current: false
  });
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Fetch licenses data on component mount
   */
  useEffect(() => {
    fetchLicensesData();
  }, []);

  /**
   * Fetch licenses from API
   */
  const fetchLicensesData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await profileService.getLicenses();
      setLicenses(data);
      
    } catch (err) {
      console.error('Error fetching licenses:', err);
      setError(err.message || 'Failed to load licenses data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      name: '',
      issuing_organization: '',
      issue_date: '',
      expiry_date: '',
      credential_id: '',
      credential_url: '',
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
    
    if (!formData.name.trim()) {
      errors.name = 'License name is required';
    }
    
    if (!formData.issuing_organization.trim()) {
      errors.issuing_organization = 'Issuing organization is required';
    }
    
    if (!formData.issue_date) {
      errors.issue_date = 'Issue date is required';
    }
    
    if (!formData.is_current && !formData.expiry_date) {
      errors.expiry_date = 'Expiry date is required unless currently valid';
    }
    
    if (formData.issue_date && formData.expiry_date && !formData.is_current) {
      if (!validationUtils.validateDateRange(formData.issue_date, formData.expiry_date)) {
        errors.expiry_date = 'Expiry date must be after issue date';
      }
    }
    
    // URL validation
    if (formData.credential_url && !isValidUrl(formData.credential_url)) {
      errors.credential_url = 'Please enter a valid URL';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * URL validation helper
   */
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
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
   * Handle adding new license
   */
  const handleAdd = async () => {
    try {
      if (!validateForm()) {
        setError('Please fix the validation errors before saving.');
        return;
      }

      setIsSaving(true);
      setError(null);
      
      const licenseData = {
        ...formData,
        expiry_date: formData.is_current ? null : formData.expiry_date
      };
      
      const newLicense = await profileService.addLicense(licenseData);
      
      setLicenses(prev => [...prev, newLicense]);
      resetForm();
      setSuccess('License added successfully!');
      
      if (onUpdate) {
        onUpdate('licenses', newLicense);
      }
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error adding license:', err);
      setError(err.message || 'Failed to add license');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle updating existing license
   */
  const handleUpdate = async () => {
    try {
      if (!validateForm()) {
        setError('Please fix the validation errors before saving.');
        return;
      }

      setIsSaving(true);
      setError(null);
      
      const licenseData = {
        ...formData,
        expiry_date: formData.is_current ? null : formData.expiry_date
      };
      
      const updatedLicense = await profileService.updateLicense(editingId, licenseData);
      
      setLicenses(prev => 
        prev.map(license => license.id === editingId ? updatedLicense : license)
      );
      
      resetForm();
      setSuccess('License updated successfully!');
      
      if (onUpdate) {
        onUpdate('licenses', updatedLicense);
      }
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error updating license:', err);
      setError(err.message || 'Failed to update license');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle deleting license
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this license?')) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      await profileService.deleteLicense(id);
      
      setLicenses(prev => prev.filter(license => license.id !== id));
      setSuccess('License deleted successfully!');
      
      if (onUpdate) {
        onUpdate('licenses', { deleted: id });
      }
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error deleting license:', err);
      setError(err.message || 'Failed to delete license');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Start editing a license
   */
  const startEditing = (license) => {
    setFormData({
      name: license.name || '',
      issuing_organization: license.issuing_organization || '',
      issue_date: license.issue_date || '',
      expiry_date: license.expiry_date || '',
      credential_id: license.credential_id || '',
      credential_url: license.credential_url || '',
      description: license.description || '',
      is_current: !license.expiry_date
    });
    setEditingId(license.id);
    setIsAdding(false);
  };

  /**
   * Start adding new license
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
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Check if license is expired
   */
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner" />
        <p>Loading licenses data...</p>
      </div>
    );
  }

  return (
    <div className="licenses-section">
      {/* Header */}
      <div className="section-header">
      <h2>Licenses & Certifications</h2>
        <p>Manage your professional licenses, certifications, and credentials</p>
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

      {/* Licenses List */}
      <div className="licenses-list">
        {licenses.length === 0 && !isAdding ? (
          <div className="empty-state">
            <p>No licenses or certifications yet. Add your first credential!</p>
            <button className="btn-primary" onClick={startAdding}>
              <FontAwesomeIcon icon={faPlus} />
              Add License
            </button>
          </div>
        ) : (
          <>
            {/* Existing Licenses */}
            {licenses.map(license => (
              <div key={license.id} className="license-card">
                <div className="license-header">
                  <div className="license-icon">
                    <FontAwesomeIcon icon={faCertificate} />
                  </div>
                  <div className="license-title">
                    <h3>{license.name}</h3>
                    <p className="issuing-org">{license.issuing_organization}</p>
                  </div>
                  <div className="license-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => startEditing(license)}
                      disabled={isSaving}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="btn-icon danger"
                      onClick={() => handleDelete(license.id)}
                      disabled={isSaving}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                
                <div className="license-content">
                  <div className="license-meta">
                    <div className="meta-item">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>
                        Issued: {formatDate(license.issue_date)}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className={`status ${license.is_current ? 'current' : isExpired(license.expiry_date) ? 'expired' : 'valid'}`}>
                        {license.is_current ? 'Currently Valid' : isExpired(license.expiry_date) ? 'Expired' : 'Valid'}
                      </span>
                    </div>
                    {!license.is_current && license.expiry_date && (
                      <div className="meta-item">
                        <span>
                          Expires: {formatDate(license.expiry_date)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {license.credential_id && (
                    <div className="credential-id">
                      <strong>Credential ID:</strong> {license.credential_id}
                    </div>
                  )}
                  
                  {license.description && (
                    <div className="license-description">
                      <p>{license.description}</p>
                    </div>
                  )}
                  
                  {license.credential_url && (
                    <div className="license-links">
                      <a 
                        href={license.credential_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="credential-link"
                      >
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                        View Credential
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add New Button */}
            {!isAdding && (
              <button className="btn-add" onClick={startAdding}>
                <FontAwesomeIcon icon={faPlus} />
                Add License
              </button>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="license-form">
          <div className="form-header">
            <h3>{editingId ? 'Edit License' : 'Add License'}</h3>
            <button className="btn-icon" onClick={handleCancel}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="form-content">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  License/Certification Name *
                  {validationErrors.name && (
                    <span className="error-text">{validationErrors.name}</span>
                  )}
                </label>
              <input
                  id="name"
                  name="name"
                type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., AWS Certified Solutions Architect"
                  className={validationErrors.name ? 'error' : ''}
              />
            </div>

              <div className="form-group">
                <label htmlFor="issuing_organization">
                  Issuing Organization *
                  {validationErrors.issuing_organization && (
                    <span className="error-text">{validationErrors.issuing_organization}</span>
                  )}
                </label>
              <input
                  id="issuing_organization"
                  name="issuing_organization"
                type="text"
                  value={formData.issuing_organization}
                  onChange={handleInputChange}
                  placeholder="e.g., Amazon Web Services"
                  className={validationErrors.issuing_organization ? 'error' : ''}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="issue_date">
                  Issue Date *
                  {validationErrors.issue_date && (
                    <span className="error-text">{validationErrors.issue_date}</span>
                  )}
                </label>
              <input
                  id="issue_date"
                  name="issue_date"
                type="date"
                  value={formData.issue_date}
                  onChange={handleInputChange}
                  className={validationErrors.issue_date ? 'error' : ''}
              />
            </div>

              <div className="form-group">
                <label htmlFor="expiry_date">
                  Expiry Date
                  {validationErrors.expiry_date && (
                    <span className="error-text">{validationErrors.expiry_date}</span>
                  )}
                </label>
              <input
                  id="expiry_date"
                  name="expiry_date"
                type="date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  disabled={formData.is_current}
                  className={validationErrors.expiry_date ? 'error' : ''}
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
                  Currently valid (no expiry date)
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="credential_id">Credential ID</label>
              <input
                id="credential_id"
                name="credential_id"
                type="text"
                value={formData.credential_id}
                onChange={handleInputChange}
                placeholder="e.g., AWS-123456789"
              />
            </div>

            <div className="form-group">
              <label htmlFor="credential_url">
                Credential URL
                {validationErrors.credential_url && (
                  <span className="error-text">{validationErrors.credential_url}</span>
                )}
              </label>
              <input
                id="credential_url"
                name="credential_url"
                type="url"
                value={formData.credential_url}
                onChange={handleInputChange}
                placeholder="https://verify.credential.com/..."
                className={validationErrors.credential_url ? 'error' : ''}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this license/certification covers..."
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
                    {editingId ? 'Update' : 'Add'} License
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

export default Licenses;
