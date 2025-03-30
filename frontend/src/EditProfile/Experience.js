// Import necessary dependencies
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Experience.css';

/**
 * Experience component for managing user's professional experience
 * Allows users to view, add, edit and delete work experiences from their profile
 * @param {Array} experiences - Array of existing experience entries
 * @param {Function} onUpdate - Callback function to update experiences
 */
const Experience = ({ experiences, onUpdate }) => {
  // Initialize state for new experience entry with empty values
  const [newExperience, setNewExperience] = useState({
    title: '', // Job title
    company: '', // Company name
    location: '', // Job location
    start_date: '', // Start date of employment
    end_date: '', // End date of employment
    is_current: false, // Whether this is current job
    description: '' // Job description
  });

  /**
   * Handles form submission for adding new experience
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Send new experience data to parent component
    onUpdate(newExperience);
    
    // Reset form fields to initial empty state
    setNewExperience({
      title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: ''
    });
  };

  return (
    <div className="experience-section">
      <h2>Experience</h2>
      
      {/* Iterate through and display existing experiences */}
      {experiences.map((exp, index) => (
        <div key={index} className="experience-item">
          <h3>{exp.title}</h3>
          <p>{exp.company}</p>
          {/* Additional experience details can be added here */}
        </div>
      ))}

      {/* Form for adding new experience entry */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Job Title"
          value={newExperience.title}
          onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
        />
        {/* Additional form fields can be added here */}
        <button type="submit">Add Experience</button>
      </form>
    </div>
  );
};

export default Experience;
