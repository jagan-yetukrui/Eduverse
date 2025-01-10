import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Licenses.css';

/**
 * Licenses component for managing user's licenses and certifications
 * Allows users to view, add, edit and delete licenses from their profile
 */
const Licenses = () => {
  // State management
  const [licenses, setLicenses] = useState([]); // Array of user's licenses
  const [error, setError] = useState(''); // Error message state
  const [successMessage, setSuccessMessage] = useState(''); // Success message state
  const [isLoading, setIsLoading] = useState(false); // Loading state for API operations

  // Fetch licenses when component mounts
  useEffect(() => {
    fetchLicenses();
  }, []);

  /**
   * Fetches user's licenses from the backend API
   */
  const fetchLicenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profiles/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLicenses(response.data.licenses || []);
    } catch (error) {
      console.error('Error fetching licenses:', error);
      setError('Failed to load licenses. Please try again.');
    }
  };

  /**
   * Handles input changes in the license form
   * @param {number} index - Index of the license being edited
   * @param {Event} event - Input change event
   */
  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const updatedLicenses = [...licenses];
    updatedLicenses[index][name] = value;
    setLicenses(updatedLicenses);
    setError('');
    setSuccessMessage('');
  };

  /**
   * Adds a new empty license form
   */
  const addLicense = () => {
    setLicenses([
      ...licenses,
      {
        name: '',
        organization: '',
        issue_date: '',
        expiration_date: '',
        credential_id: '',
        credential_url: '',
      },
    ]);
  };

  /**
   * Removes a license at specified index
   * @param {number} index - Index of license to remove
   */
  const removeLicense = async (index) => {
    setIsLoading(true);
    try {
      const licenseToDelete = licenses[index];
      if (licenseToDelete.id) { // Only make API call if license exists in backend
        const token = localStorage.getItem('token');
        await axios.delete(`/api/profiles/delete-license/${licenseToDelete.id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      const updatedLicenses = licenses.filter((_, i) => i !== index);
      setLicenses(updatedLicenses);
      setSuccessMessage('License removed successfully');
    } catch (error) {
      console.error('Error removing license:', error);
      setError('Failed to remove license. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles form submission
   * Validates and sends license data to backend
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/profiles/update-licenses/',
        { licenses },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setLicenses(response.data.licenses);
      setSuccessMessage('Licenses updated successfully');
    } catch (error) {
      console.error('Error updating licenses:', error);
      setError('Failed to update licenses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="licenses-container">
      <h2>Licenses & Certifications</h2>

      {/* Error and success messages */}
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        {licenses.map((license, index) => (
          <div key={index} className="license-item">
            <div className="input-group">
              <label htmlFor={`name-${index}`}>Name</label>
              <input
                type="text"
                id={`name-${index}`}
                name="name"
                value={license.name}
                onChange={(e) => handleChange(index, e)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor={`organization-${index}`}>Issuing Organization</label>
              <input
                type="text"
                id={`organization-${index}`}
                name="organization"
                value={license.organization}
                onChange={(e) => handleChange(index, e)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor={`issue_date-${index}`}>Issue Date</label>
              <input
                type="date"
                id={`issue_date-${index}`}
                name="issue_date"
                value={license.issue_date}
                onChange={(e) => handleChange(index, e)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor={`expiration_date-${index}`}>Expiration Date</label>
              <input
                type="date"
                id={`expiration_date-${index}`}
                name="expiration_date"
                value={license.expiration_date}
                onChange={(e) => handleChange(index, e)}
              />
            </div>
            <div className="input-group">
              <label htmlFor={`credential_id-${index}`}>Credential ID</label>
              <input
                type="text"
                id={`credential_id-${index}`}
                name="credential_id"
                value={license.credential_id}
                onChange={(e) => handleChange(index, e)}
              />
            </div>
            <div className="input-group">
              <label htmlFor={`credential_url-${index}`}>Credential URL</label>
              <input
                type="url"
                id={`credential_url-${index}`}
                name="credential_url"
                value={license.credential_url}
                onChange={(e) => handleChange(index, e)}
              />
            </div>
            <button
              type="button"
              className="remove-button"
              onClick={() => removeLicense(index)}
              disabled={isLoading}
            >
              {isLoading ? 'Removing...' : 'Remove'}
            </button>
          </div>
        ))}
        <button
          type="button"
          className="add-button"
          onClick={addLicense}
          disabled={isLoading}
        >
          Add Another License/Certification
        </button>
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
};

export default Licenses;
