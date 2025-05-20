// Import necessary React hooks and components
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Experience from './Experience';
import Education from './Education';
import Skills from './Skills';
import './EditProfile.css';

// Import FontAwesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBriefcase, 
  faGraduationCap, 
  faLightbulb, 
  faArrowLeft,
  faTimes,
  faUndo,
  faUser,
  faExclamationCircle,
  faCheckCircle,
  faCamera,
  faSave,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

// Import axios for API calls
import axios from 'axios';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('EditProfile Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong.</h2>
          <p>Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * EditProfile component that serves as the main profile editing interface
 * Provides navigation between different sections of the profile (Experience, Education, etc.)
 * Implements a responsive sidebar navigation that collapses on mobile
 * Manages state for active section, errors, success messages and profile data
 * Handles API calls to fetch and update profile information
 */
const EditProfile = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);
  
  const [profileData, setProfileData] = useState({
    display_name: '',
    bio: '',
    website: '',
    location: '',
    education_details: [],
    experiences: [],
    licenses: [],
    skills: [],
    profile_image: null
  });

  // Debug logging
  useEffect(() => {
    console.log('EditProfile State:', {
      profileData,
      preview,
      skillInput,
      status,
      error,
      isLoading
    });
  }, [profileData, preview, skillInput, status, error, isLoading]);

  // Effect hook to fetch profile data when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await axios.get('/api/profiles/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.data) {
          throw new Error('No data received from server');
        }

        setProfileData(response.data);
        setOriginalData(response.data);
        if (response.data.profile_image) {
          setPreview(response.data.profile_image);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  /**
   * Closes the active section and returns to main view
   */
  const handleCloseModal = () => {
    setActiveSection(null);
  };

  const handleImageUpload = useCallback((e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        setProfileData(prev => ({ ...prev, profile_image: file }));
        setPreview(URL.createObjectURL(file));
      }
    } catch (err) {
      console.error('Error handling image upload:', err);
      setError('Failed to process image. Please try again.');
    }
  }, []);

  const handleSkillEnter = useCallback((e) => {
    try {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const newSkill = skillInput.trim().replace(/,$/, '');
        if (newSkill && !profileData.skills.includes(newSkill)) {
          setProfileData(prev => ({
            ...prev,
            skills: [...prev.skills, newSkill]
          }));
          setSkillInput('');
        }
      }
    } catch (err) {
      console.error('Error handling skill input:', err);
      setError('Failed to add skill. Please try again.');
    }
  }, [skillInput, profileData.skills]);

  const removeSkill = useCallback((skillToRemove) => {
    try {
      setProfileData(prev => ({
        ...prev,
        skills: prev.skills.filter(skill => skill !== skillToRemove)
      }));
    } catch (err) {
      console.error('Error removing skill:', err);
      setError('Failed to remove skill. Please try again.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      
      // Append all profile data to FormData
      Object.keys(profileData).forEach(key => {
        if (key === 'profile_image' && profileData[key]) {
          formData.append(key, profileData[key]);
        } else if (Array.isArray(profileData[key])) {
          formData.append(key, JSON.stringify(profileData[key]));
        } else {
          formData.append(key, profileData[key]);
        }
      });

      await axios.patch('/api/profiles/me/', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setStatus('Profile saved successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
      setStatus('');
    }
  };

  /**
   * Handles updates from child components (Experience, Education, etc.)
   * Makes API call to update specific section and updates local state
   * @param {string} section - Section being updated (experience, education, etc.)
   * @param {Object} data - Updated data for the section
   */
  const handleSectionUpdate = async (section, data) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = `/api/profiles/me/${section}/`;
      
      // Make API call to update section
      await axios.post(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state based on whether section data is an array or object
      setProfileData(prev => ({
        ...prev,
        [section]: Array.isArray(prev[section]) 
          ? [...prev[section], data]
          : data
      }));

      // Show success message temporarily
      setStatus(`${section} updated successfully!`);
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      // Show error message temporarily
      setError(`Failed to update ${section}. Please try again.`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRevert = useCallback(() => {
    if (!originalData) return;
    setProfileData(originalData);
    setPreview(originalData.profile_image || null);
    setSkillInput('');
    setStatus('Changes reverted');
    setTimeout(() => setStatus(''), 2000);
  }, [originalData]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile data...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className={`edit-profile-container ${activeSection ? 'sidebar-active' : ''}`}>
        {/* Header with Back and Revert buttons */}
        <div className="edit-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Profile
            </button>
            <h1 className="edit-title">Edit Profile</h1>
          </div>
          <div className="header-right">
            <button 
              className="revert-btn" 
              onClick={handleRevert}
              disabled={!originalData || JSON.stringify(profileData) === JSON.stringify(originalData)}
            >
              <FontAwesomeIcon icon={faUndo} /> Revert Changes
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="edit-progress">
          <div className="progress-steps">
            <div className={`step ${activeSection === null ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Basic Info</span>
            </div>
            <div className={`step ${activeSection === 'experience' ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Experience</span>
            </div>
            <div className={`step ${activeSection === 'education' ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Education</span>
            </div>
            <div className={`step ${activeSection === 'skills' ? 'active' : ''}`}>
              <span className="step-number">4</span>
              <span className="step-label">Skills</span>
            </div>
          </div>
        </div>

        {/* Navigation sidebar */}
      <nav className={`edit-profile-nav ${activeSection ? 'sidebar' : ''}`}>
        {activeSection && (
          <div className="back-button" onClick={handleCloseModal}>
            <FontAwesomeIcon icon={faArrowLeft} className="icon" />
              <span>Back to Sections</span>
          </div>
        )}
          <div className="nav-items">
            <div 
              className={`nav-item ${activeSection === null ? 'active' : ''}`} 
              onClick={() => setActiveSection(null)}
            >
              <FontAwesomeIcon icon={faUser} className="icon" />
              <span>Basic Info</span>
            </div>
            <div 
              className={`nav-item ${activeSection === 'experience' ? 'active' : ''}`} 
              onClick={() => setActiveSection('experience')}
            >
          <FontAwesomeIcon icon={faBriefcase} className="icon" />
          <span>Experience</span>
        </div>
            <div 
              className={`nav-item ${activeSection === 'education' ? 'active' : ''}`} 
              onClick={() => setActiveSection('education')}
            >
          <FontAwesomeIcon icon={faGraduationCap} className="icon" />
          <span>Education</span>
        </div>
            <div 
              className={`nav-item ${activeSection === 'skills' ? 'active' : ''}`} 
              onClick={() => setActiveSection('skills')}
            >
          <FontAwesomeIcon icon={faLightbulb} className="icon" />
          <span>Skills</span>
        </div>
        </div>
      </nav>

        {/* Status messages */}
        <div className="status-container">
      {error && (
        <div className="error-message">
              <FontAwesomeIcon icon={faExclamationCircle} />
          {error}
        </div>
      )}
          {status && (
        <div className="success-message">
              <FontAwesomeIcon icon={faCheckCircle} />
              {status}
            </div>
          )}
        </div>

        {/* Main content area */}
        <div className="edit-profile-content">
          {activeSection === null && (
            <div className="basic-info-section">
              <div className="section">
                <h2>Profile Picture</h2>
                <div className="form-group">
                  <div className="image-upload-container">
                    {preview ? (
                      <div className="image-preview">
                        <img src={preview} alt="Profile preview" className="preview-img" />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => {
                            setPreview(null);
                            setProfileData(prev => ({ ...prev, profile_image: null }));
                          }}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <FontAwesomeIcon icon={faCamera} size="2x" />
                        <span>Click to upload profile picture</span>
                      </div>
                    )}
                    <input
                      id="profile_image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden-input"
                    />
                  </div>
                </div>
              </div>

              <div className="section">
                <h2>Basic Information</h2>
                <div className="form-group">
                  <label htmlFor="display_name">Display Name</label>
                  <input
                    id="display_name"
                    type="text"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Enter your display name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                </div>
              </div>

              <div className="section">
                <h2>Skills</h2>
                <div className="form-group">
                  <label htmlFor="skills">Add Skills</label>
                  <div className="skills-input-container">
                    <input
                      id="skills"
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillEnter}
                      placeholder="Type a skill and press Enter or comma"
                    />
                    <button 
                      className="add-skill-btn"
                      onClick={() => {
                        if (skillInput.trim()) {
                          handleSkillEnter({ key: 'Enter', preventDefault: () => {} });
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div className="skills-preview">
                    {profileData.skills.map(skill => (
                      <span key={skill} className="tag">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="remove-skill"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
        </div>
      )}

          {/* Section components */}
        {activeSection === 'experience' && (
          <Experience 
            experiences={profileData.experiences}
            onUpdate={(data) => handleSectionUpdate('experience', data)}
          />
        )}
        {activeSection === 'education' && (
          <Education 
            education={profileData.education_details}
            onUpdate={(data) => handleSectionUpdate('education', data)}
          />
        )}
        {activeSection === 'skills' && (
          <Skills 
            skills={profileData.skills}
            onUpdate={(data) => handleSectionUpdate('skills', data)}
          />
        )}
        
          {/* Save button */}
          <div className="save-container">
        <button 
              type="submit" 
              className="save-btn" 
              onClick={handleSubmit}
              disabled={status === 'Saving...' || JSON.stringify(profileData) === JSON.stringify(originalData)}
        >
              {status === 'Saving...' ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} /> Save Changes
                </>
              )}
        </button>
      </div>
    </div>
      </div>
    </ErrorBoundary>
  );
};

export default EditProfile;
