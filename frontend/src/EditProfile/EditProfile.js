// Import necessary React hooks and components
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Experience from './Experience';
import Education from './Education';
import Skills from './Skills';
import Projects from './Projects';
import Licenses from './Licenses';
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
  faSpinner,
  faCertificate,
  faProjectDiagram,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';

// Import axios for API calls
import axios from 'axios';

// Import services and utilities
import { profileService, validationUtils, fileUtils } from '../services/profileService';
import { useProfile } from '../Profile/ProfileContext';

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
          <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" />
          <h2>Something went wrong</h2>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
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
  const { profile, setProfile, isLoading: profileLoading, error: profileError } = useProfile();
  const [activeSection, setActiveSection] = useState('basic');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
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

  const [originalData, setOriginalData] = useState(null);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const [validationErrors, setValidationErrors] = useState({});
  
  const fileInputRef = useRef(null);
  const dragDropRef = useRef(null);

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: faUser },
    { id: 'education', label: 'Education', icon: faGraduationCap },
    { id: 'experience', label: 'Experience', icon: faBriefcase },
    { id: 'projects', label: 'Projects', icon: faProjectDiagram },
    { id: 'licenses', label: 'Licenses', icon: faCertificate },
    { id: 'skills', label: 'Skills', icon: faLightbulb }
  ];

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        fileUtils.cleanupPreview(imagePreview);
      }
    };
  }, [imagePreview]);

    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
      setError(null);
      
      const data = await profileService.getProfile();
      
      setProfileData({
        display_name: data.display_name || '',
        bio: data.bio || '',
        website: data.website || '',
        location: data.location || '',
        profile_image: data.profile_image
      });
      
      setOriginalData({
        display_name: data.display_name || '',
        bio: data.bio || '',
        website: data.website || '',
        location: data.location || '',
        profile_image: data.profile_image
      });
      
      if (data.profile_image_url) {
        setImagePreview(data.profile_image_url);
        }
      
      if (setProfile) {
        setProfile(data);
      }
      
      } catch (err) {
        console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

  const handleImageUpload = useCallback((file) => {
    try {
      const validationError = validationUtils.validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      if (imagePreview && imagePreview.startsWith('blob:')) {
        fileUtils.cleanupPreview(imagePreview);
      }

      const preview = fileUtils.createImagePreview(file);
      setImagePreview(preview);
      setImageFile(file);
      setError(null);
      
    } catch (err) {
      console.error('Error handling image upload:', err);
      setError('Failed to process image. Please try again.');
    }
  }, [imagePreview]);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
        e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const removeProfileImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      fileUtils.cleanupPreview(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
    setProfileData(prev => ({ ...prev, profile_image: null }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!profileData.display_name.trim()) {
      errors.display_name = 'Display name is required';
    }
    
    if (profileData.website && !isValidUrl(profileData.website)) {
      errors.website = 'Please enter a valid URL';
        }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSave = async () => {
    try {
      if (!validateForm()) {
        setError('Please fix the validation errors before saving.');
        return;
    }

      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const dataToSave = {
        display_name: profileData.display_name.trim(),
        bio: profileData.bio.trim(),
        website: profileData.website.trim(),
        location: profileData.location.trim()
      };

      const updatedProfile = await profileService.updateProfile(dataToSave, imageFile);
      
      setProfileData(prev => ({
        ...prev,
        ...dataToSave,
        profile_image: updatedProfile.profile_image_url || prev.profile_image
      }));
      
      setOriginalData(prev => ({
        ...prev,
        ...dataToSave,
        profile_image: updatedProfile.profile_image_url || prev.profile_image
      }));

      if (setProfile) {
        setProfile(updatedProfile);
      }

      setSuccess('Profile updated successfully!');
      
      setImageFile(null);
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevert = () => {
    if (!originalData) return;
    
    if (imagePreview && imagePreview.startsWith('blob:')) {
      fileUtils.cleanupPreview(imagePreview);
    }
    
    setProfileData(originalData);
    setImagePreview(originalData.profile_image || null);
    setImageFile(null);
    setValidationErrors({});
    setError(null);
    setSuccess('Changes reverted successfully');
    
    setTimeout(() => setSuccess(null), 2000);
  };

  const hasUnsavedChanges = () => {
    if (!originalData) return false;
    
    const currentData = {
      ...profileData,
      profile_image: imageFile ? 'new_image' : profileData.profile_image
    };
    
    return JSON.stringify(currentData) !== JSON.stringify(originalData);
  };

  const handleSectionUpdate = useCallback((section, data) => {
    setSuccess(`${section} updated successfully!`);
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="edit-profile-container">
        <div className="edit-profile-header">
          <div className="header-left">
            <button 
              className="btn-back"
              onClick={() => navigate(-1)}
              disabled={isSaving}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back
            </button>
            <h1>Edit Profile</h1>
          </div>
          
          <div className="header-right">
            {hasUnsavedChanges() && (
              <button 
                className="btn-revert"
                onClick={handleRevert}
                disabled={isSaving}
              >
                <FontAwesomeIcon icon={faUndo} />
                Revert
              </button>
            )}
            
            <button 
              className="btn-save"
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges()}
            >
              {isSaving ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

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

        <div className="section-navigation">
          {sections.map(section => (
            <button
              key={section.id}
              className={`nav-tab ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
              disabled={isSaving}
            >
              <FontAwesomeIcon icon={section.icon} />
              {section.label}
            </button>
          ))}
        </div>

        <div className="edit-profile-content">
          {activeSection === 'basic' && (
            <div className="section-content basic-info">
              <div className="section-header">
                <h2>Basic Information</h2>
                <p>Update your personal information and profile picture</p>
              </div>

              <div className="form-section">
                <h3>Profile Picture</h3>
                <div 
                  className="image-upload-area"
                  ref={dragDropRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                      <div className="image-preview">
                      <img src={imagePreview} alt="Profile preview" />
                        <button
                          className="remove-image"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProfileImage();
                          }}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                      <FontAwesomeIcon icon={faCamera} />
                      <p>Click to upload or drag and drop</p>
                      <span>Supports: JPG, PNG, GIF (max 5MB)</span>
                      </div>
                    )}
                </div>
                
                    <input
                  ref={fileInputRef}
                      type="file"
                      accept="image/*"
                  onChange={handleFileInputChange}
                      className="hidden-input"
                    />
              </div>

              <div className="form-section">
                <h3>Personal Information</h3>
                
                <div className="form-group">
                  <label htmlFor="display_name">
                    Display Name *
                    {validationErrors.display_name && (
                      <span className="error-text">{validationErrors.display_name}</span>
                    )}
                  </label>
                  <input
                    id="display_name"
                    type="text"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      display_name: e.target.value 
                    }))}
                    placeholder="Enter your display name"
                    className={validationErrors.display_name ? 'error' : ''}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      bio: e.target.value 
                    }))}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      location: e.target.value 
                    }))}
                    placeholder="City, Country"
                  />
              </div>

                <div className="form-group">
                  <label htmlFor="website">
                    Website
                    {validationErrors.website && (
                      <span className="error-text">{validationErrors.website}</span>
                    )}
                  </label>
                    <input
                    id="website"
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      website: e.target.value 
                    }))}
                    placeholder="https://your-website.com"
                    className={validationErrors.website ? 'error' : ''}
                  />
                </div>
              </div>
        </div>
      )}

          {activeSection === 'education' && (
            <Education onUpdate={(data) => handleSectionUpdate('education', data)} />
          )}

        {activeSection === 'experience' && (
            <Experience onUpdate={(data) => handleSectionUpdate('experience', data)} />
        )}

          {activeSection === 'projects' && (
            <Projects onUpdate={(data) => handleSectionUpdate('projects', data)} />
        )}

          {activeSection === 'licenses' && (
            <Licenses onUpdate={(data) => handleSectionUpdate('licenses', data)} />
        )}
        
          {activeSection === 'skills' && (
            <Skills onUpdate={(data) => handleSectionUpdate('skills', data)} />
          )}
    </div>
      </div>
    </ErrorBoundary>
  );
};

export default EditProfile;
