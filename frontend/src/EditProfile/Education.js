import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Education.css';

/**
 * Education component for managing user's educational history
 * Allows users to view, add, edit and delete education entries from their profile
 */
const Education = ({ education, onUpdate }) => {
  // State management
  const [educationEntries, setEducationEntries] = useState([]); // Array of education entries
  const [error, setError] = useState(''); // Error message state
  const [successMessage, setSuccessMessage] = useState(''); // Success message state
  const [isLoading, setIsLoading] = useState(false); // Loading state for API operations

  // Comprehensive list of degree options
  const degreeOptions = [
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
  ];

  // Comprehensive list of major options
  const majorOptions = [
    'Accounting',
    'Aerospace Engineering',
    'Agricultural Science',
    'Anthropology',
    'Architecture',
    'Art History',
    'Artificial Intelligence',
    'Astronomy',
    'Biochemistry',
    'Biology',
    'Biomedical Engineering',
    'Business Administration',
    'Chemical Engineering',
    'Chemistry',
    'Civil Engineering',
    'Communications',
    'Computer Engineering',
    'Computer Science',
    'Criminal Justice',
    'Cybersecurity',
    'Data Science',
    'Economics',
    'Education',
    'Electrical Engineering',
    'English Literature',
    'Environmental Science',
    'Finance',
    'Food Science',
    'Forensic Science',
    'Game Design',
    'Genetics',
    'Geography',
    'Geology',
    'Graphic Design',
    'History',
    'Human Resources',
    'Industrial Engineering',
    'Information Systems',
    'Information Technology',
    'International Business',
    'Journalism',
    'Linguistics',
    'Marketing',
    'Mathematics',
    'Mechanical Engineering',
    'Media Studies',
    'Music',
    'Neuroscience',
    'Nursing',
    'Nutrition',
    'Philosophy',
    'Physics',
    'Political Science',
    'Psychology',
    'Public Health',
    'Robotics Engineering',
    'Social Work',
    'Sociology',
    'Software Engineering',
    'Statistics',
    'Theater Arts',
    'Urban Planning',
    'Veterinary Science',
    'Web Development',
  ];

  // Initialize with passed education data
  useEffect(() => {
    if (education) {
      setEducationEntries(education);
    }
  }, [education]);

  /**
   * Handles adding new education entry
   */
  const handleAddEducation = async (educationData) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/profiles/me/education/',
        educationData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update local state and notify parent
      const updatedEntries = [...educationEntries, response.data];
      setEducationEntries(updatedEntries);
      onUpdate(updatedEntries);
      setSuccessMessage('Education entry added successfully');
    } catch (error) {
      console.error('Error adding education:', error);
      setError(error.response?.data?.message || 'Failed to add education entry');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles updating existing education entry
   */
  const handleUpdateEducation = async (id, educationData) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/profiles/me/education/`,
        { ...educationData, id },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update local state and notify parent
      const updatedEntries = educationEntries.map(entry => 
        entry.id === id ? response.data : entry
      );
      setEducationEntries(updatedEntries);
      onUpdate(updatedEntries);
      setSuccessMessage('Education entry updated successfully');
    } catch (error) {
      console.error('Error updating education:', error);
      setError(error.response?.data?.message || 'Failed to update education entry');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles removing education entry
   */
  const handleRemoveEducation = async (id) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/profiles/me/education/`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { id }
      });
      
      // Update local state and notify parent
      const updatedEntries = educationEntries.filter(entry => entry.id !== id);
      setEducationEntries(updatedEntries);
      onUpdate(updatedEntries);
      setSuccessMessage('Education entry removed successfully');
    } catch (error) {
      console.error('Error removing education:', error);
      setError(error.response?.data?.message || 'Failed to remove education entry');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (event, entry) => {
    event.preventDefault();
    
    // Validate dates
    if (new Date(entry.end_date) < new Date(entry.start_date)) {
      setError('End date cannot be before start date');
      return;
    }

    try {
      if (entry.id) {
        await handleUpdateEducation(entry.id, entry);
      } else {
        await handleAddEducation(entry);
      }
    } catch (error) {
      setError('Failed to save education entry');
    }
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updatedEducation = [...educationEntries];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [name]: value
    };
    setEducationEntries(updatedEducation);
  };

  return (
    <div className="education-container">
      <h2>Education History</h2>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      {/* Display existing education entries */}
      {educationEntries.map((entry, index) => (
        <div key={entry.id || index} className="education-entry">
          <form onSubmit={(e) => handleSubmit(e, entry)}>
            <div className="input-group">
              <label>University</label>
              <input
                type="text"
                name="university"
                value={entry.university}
                onChange={(e) => handleChange(e, index)}
                placeholder="Enter university name"
                required
              />
            </div>
            <div className="input-group">
              <label>Degree</label>
              <select
                name="degree"
                value={entry.degree}
                onChange={(e) => handleChange(e, index)}
                required
              >
                <option value="">Select degree</option>
                {degreeOptions.map((degree, idx) => (
                  <option key={idx} value={degree}>
                    {degree}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Major</label>
              <select
                name="major"
                value={entry.major}
                onChange={(e) => handleChange(e, index)}
                required
              >
                <option value="">Select major</option>
                {majorOptions.map((major, idx) => (
                  <option key={idx} value={major}>
                    {major}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Start Date</label>
              <input
                type="date"
                name="start_date"
                value={entry.start_date}
                onChange={(e) => handleChange(e, index)}
                required
              />
            </div>
            <div className="input-group">
              <label>End Date</label>
              <input
                type="date"
                name="end_date"
                value={entry.end_date}
                onChange={(e) => handleChange(e, index)}
                min={entry.start_date}
                required
              />
            </div>
            <div className="input-group">
              <label>Bio/Description (optional)</label>
              <textarea
                name="bio"
                value={entry.bio}
                onChange={(e) => handleChange(e, index)}
                placeholder="Describe your educational experience, achievements, etc."
              />
            </div>
            <div className="button-group">
              <button 
                type="submit" 
                className="save-button"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Entry'}
              </button>
              {entry.id && (
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(entry.id)}
                  className="remove-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Removing...' : 'Remove Entry'}
                </button>
              )}
            </div>
          </form>
        </div>
      ))}

      {/* Add new education entry button */}
      <button
        type="button"
        onClick={() => setEducationEntries([...educationEntries, {
          university: '',
          degree: '',
          major: '',
          start_date: '',
          end_date: '',
          bio: '',
        }])}
        className="add-button"
        disabled={isLoading}
      >
        Add New Education Entry
      </button>
    </div>
  );
};

export default Education;
