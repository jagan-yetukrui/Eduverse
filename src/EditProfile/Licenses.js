import React, { useState } from 'react';
import './Licenses.css';

const Licenses = () => {
  const [licenses, setLicenses] = useState([
    {
      name: '',
      organization: '',
      issueDate: '',
      expirationDate: '',
      credentialId: '',
      credentialUrl: '',
    },
  ]);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const updatedLicenses = [...licenses];
    updatedLicenses[index][name] = value;
    setLicenses(updatedLicenses);
  };

  const addLicense = () => {
    setLicenses([
      ...licenses,
      {
        name: '',
        organization: '',
        issueDate: '',
        expirationDate: '',
        credentialId: '',
        credentialUrl: '',
      },
    ]);
  };

  const removeLicense = (index) => {
    const updatedLicenses = licenses.filter((_, i) => i !== index);
    setLicenses(updatedLicenses);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission, e.g., send data to the backend
    console.log('Licenses:', licenses);
  };

  return (
    <div className="licenses-container">
      <h2>Licenses & Certifications</h2>
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
              <label htmlFor={`issueDate-${index}`}>Issue Date</label>
              <input
                type="date"
                id={`issueDate-${index}`}
                name="issueDate"
                value={license.issueDate}
                onChange={(e) => handleChange(index, e)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor={`expirationDate-${index}`}>Expiration Date</label>
              <input
                type="date"
                id={`expirationDate-${index}`}
                name="expirationDate"
                value={license.expirationDate}
                onChange={(e) => handleChange(index, e)}
              />
            </div>
            <div className="input-group">
              <label htmlFor={`credentialId-${index}`}>Credential ID</label>
              <input
                type="text"
                id={`credentialId-${index}`}
                name="credentialId"
                value={license.credentialId}
                onChange={(e) => handleChange(index, e)}
              />
            </div>
            <div className="input-group">
              <label htmlFor={`credentialUrl-${index}`}>Credential URL</label>
              <input
                type="url"
                id={`credentialUrl-${index}`}
                name="credentialUrl"
                value={license.credentialUrl}
                onChange={(e) => handleChange(index, e)}
              />
            </div>
            <button
              type="button"
              className="remove-button"
              onClick={() => removeLicense(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="add-button"
          onClick={addLicense}
        >
          Add Another License/Certification
        </button>
        <button type="submit" className="submit-button">
          Save
        </button>
      </form>
    </div>
  );
};

export default Licenses;
