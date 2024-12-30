import React, { useState } from 'react';
import './Experience.css';

const Experience = () => {
  const [experiences, setExperiences] = useState([
    {
      companyName: '',
      location: '',
      workMode: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
    },
  ]);

  const handleChange = (index, event) => {
    const { name, value, type, checked } = event.target;
    const updatedExperiences = [...experiences];
    updatedExperiences[index][name] = type === 'checkbox' ? checked : value;
    setExperiences(updatedExperiences);
  };

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        companyName: '',
        location: '',
        workMode: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
      },
    ]);
  };

  const handleDeleteExperience = (index) => {
    const updatedExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(updatedExperiences);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Submitted Experiences:', experiences);
    // Add backend submission logic here if needed
  };

  return (
    <div className="experience-container">
      <h2>Professional Experience</h2>
      <form onSubmit={handleSubmit}>
        {experiences.map((experience, index) => (
          <div key={index} className="experience-item">
            <div className="input-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={experience.companyName}
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
                name="workMode"
                value={experience.workMode}
                onChange={(e) => handleChange(index, e)}
                required
              >
                <option value="">Select...</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div className="input-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={experience.startDate}
                onChange={(e) => handleChange(index, e)}
                required
              />
            </div>
            <div className="input-group">
              <label>
                <input
                  type="checkbox"
                  name="currentlyWorking"
                  checked={experience.currentlyWorking}
                  onChange={(e) => handleChange(index, e)}
                />
                Currently Working Here
              </label>
            </div>
            {!experience.currentlyWorking && (
              <div className="input-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={experience.endDate}
                  onChange={(e) => handleChange(index, e)}
                  min={experience.startDate}
                  required
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => handleDeleteExperience(index)}
              className="delete-button"
            >
              Delete
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddExperience}
          className="add-button"
        >
          Add Experience
        </button>
        <button type="submit" className="submit-button">
          Save Experiences
        </button>
      </form>
    </div>
  );
};

export default Experience;
