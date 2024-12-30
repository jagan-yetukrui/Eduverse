import React, { useState, useEffect } from 'react';
import './Education.css';

const Education = () => {
  const [educationEntries, setEducationEntries] = useState([
    {
      university: '',
      degree: '',
      major: '',
      startDate: '',
      endDate: '',
      bio: '',
    },
  ]);

  const degreeOptions = [
    'Associate of Arts (A.A.)',
    'Associate of Science (A.S.)',
    'Bachelor of Arts (B.A.)',
    'Bachelor of Science (B.S.)',
    'Master of Arts (M.A.)',
    'Master of Science (M.S.)',
    'Doctor of Philosophy (Ph.D.)',
    'Doctor of Education (Ed.D.)',
    'Juris Doctor (J.D.)',
    'Doctor of Medicine (M.D.)',
  ];

  const majorOptions = [
    'Accounting',
    'Aerospace Engineering',
    'Anthropology',
    'Architecture',
    'Art History',
    'Biology',
    'Business Administration',
    'Chemical Engineering',
    'Chemistry',
    'Civil Engineering',
    'Computer Science',
    'Criminal Justice',
    'Economics',
    'Education',
    'Electrical Engineering',
    'English Literature',
    'Environmental Science',
    'Finance',
    'History',
    'Information Technology',
    'Journalism',
    'Marketing',
    'Mathematics',
    'Mechanical Engineering',
    'Nursing',
    'Philosophy',
    'Physics',
    'Political Science',
    'Psychology',
    'Sociology',
    'Software Engineering',
    'Theater Arts',
  ];

  // Load data from local storage on component mount
  useEffect(() => {
    const storedEducation = localStorage.getItem('education');
    if (storedEducation) {
      setEducationEntries(JSON.parse(storedEducation));
    }
  }, []);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const updatedEntries = [...educationEntries];
    updatedEntries[index][name] = value;
    setEducationEntries(updatedEntries);
  };

  const handleAddEntry = async () => {
    // Send the new education entry to the backend
    const newEntry = {
      university: '',
      degree: '',
      major: '',
      startDate: '',
      endDate: '',
      bio: '',
    };
    try {
      const response = await fetch('https://your-backend-api.com/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) {
        throw new Error('Failed to save to server.');
      }

      const savedEntry = await response.json();

      const updatedEducationList = [...educationEntries, savedEntry];
      setEducationEntries(updatedEducationList);
      localStorage.setItem('education', JSON.stringify(updatedEducationList));
    } catch (error) {
      console.error('Error adding education entry:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleRemoveEntry = async (index) => {
    const entryToDelete = educationEntries[index];

    try {
      await fetch(`https://your-backend-api.com/education/${entryToDelete.id}`, {
        method: 'DELETE',
      });

      const updatedEntries = educationEntries.filter((_, i) => i !== index);
      setEducationEntries(updatedEntries);
      localStorage.setItem('education', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Error deleting entry. Please try again.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await fetch('https://your-backend-api.com/education/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(educationEntries),
      });
      localStorage.setItem('education', JSON.stringify(educationEntries));
      alert('Education history saved successfully.');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="education-container">
      <h2>Education History</h2>
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
                name="startDate"
                value={entry.startDate}
                onChange={(e) => handleChange(index, e)}
                required
              />
            </div>
            <div className="input-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={entry.endDate}
                onChange={(e) => handleChange(index, e)}
                required
              />
            </div>
            <div className="input-group">
              <label>Bio/Description (optional)</label>
              <textarea
                name="bio"
                value={entry.bio}
                onChange={(e) => handleChange(index, e)}
                placeholder="Describe your experience"
              />
            </div>
            {educationEntries.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveEntry(index)}
                className="remove-button"
              >
                Remove Entry
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddEntry}
          className="add-button"
        >
          Add Another Education Entry
        </button>
        <button type="submit" className="submit-button">
          Save Education History
        </button>
      </form>
    </div>
  );
};

export default Education;
