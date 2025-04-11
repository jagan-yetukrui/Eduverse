import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Education.css';

/**
 * Education component for managing user's educational history
 * Allows users to view, add, edit and delete education entries from their profile
 */
const Education = () => {
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

  // Fetch education entries when component mounts
  useEffect(() => {
    fetchEducation();
  }, []);

  /**
   * Fetches user's education entries from the backend API
   */
  const fetchEducation = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profiles/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEducationEntries(response.data.education || [{
        university: '',
        degree: '',
        major: '',
        start_date: '',
        end_date: '',
        bio: '',
      }]);
    } catch (error) {
      console.error('Error fetching education:', error);
      setError('Failed to load education history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles input changes in the education form
   * @param {number} index - Index of education entry being edited
   * @param {Event} event - Input change event
   */
  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const updatedEntries = [...educationEntries];
    updatedEntries[index][name] = value;
    setEducationEntries(updatedEntries);
    setError('');
    setSuccessMessage('');
  };

  /**
   * Adds a new empty education entry
   */
  const handleAddEntry = () => {
    setEducationEntries([
      ...educationEntries,
      {
        university: '',
        degree: '',
        major: '',
        start_date: '',
        end_date: '',
        bio: '',
      },
    ]);
  };

  /**
   * Removes an education entry at specified index
   * @param {number} index - Index of entry to remove
   */
  const handleRemoveEntry = async (index) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const entryToDelete = educationEntries[index];
      
      if (entryToDelete.id) {
        await axios.delete(`/api/education/${entryToDelete.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      const updatedEntries = educationEntries.filter((_, i) => i !== index);
      setEducationEntries(updatedEntries);
      setSuccessMessage('Education entry removed successfully');
    } catch (error) {
      console.error('Error removing education entry:', error);
      setError('Failed to remove education entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles form submission to save all education entries
   * @param {Event} event - Form submission event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.put('/api/profiles/education/', 
        { education: educationEntries },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setSuccessMessage('Education history saved successfully');
      setError('');
    } catch (error) {
      console.error('Error saving education history:', error);
      setError('Failed to save education history. Please try again.');
      setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="education-container">
      <h2>Education History</h2>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <form onSubmit={handleSubmit}>
        {educationEntries.map((entry, index) => (
          <div key={index} className="education-entry">
            <div className="input-group">
              <label>University</label>
              <input
                type="text"
                name="university"
                value={entry.university}
                onChange={(e) => handleChange(index, e)}
                placeholder="Enter university name"
                required
              />
            </div>
            <div className="input-group">
              <label>Degree</label>
              <select
                name="degree"
                value={entry.degree}
                onChange={(e) => handleChange(index, e)}
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
                onChange={(e) => handleChange(index, e)}
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
                onChange={(e) => handleChange(index, e)}
                required
              />
            </div>
            <div className="input-group">
              <label>End Date</label>
              <input
                type="date"
                name="end_date"
                value={entry.end_date}
                onChange={(e) => handleChange(index, e)}
                min={entry.start_date}
                required
              />
            </div>
            <div className="input-group">
              <label>Bio/Description (optional)</label>
              <textarea
                name="bio"
                value={entry.bio}
                onChange={(e) => handleChange(index, e)}
                placeholder="Describe your educational experience, achievements, etc."
              />
            </div>
            {educationEntries.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveEntry(index)}
                className="remove-button"
                disabled={isLoading}
              >
                {isLoading ? 'Removing...' : 'Remove Entry'}
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddEntry}
          className="add-button"
          disabled={isLoading}
        >
          Add Another Education Entry
        </button>
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Education History'}
        </button>
      </form>
    </div>
  );
};

export default Education;
