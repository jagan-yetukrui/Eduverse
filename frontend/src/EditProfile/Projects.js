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
  faExternalLinkAlt,
  faCode,
  faCalendarAlt,
  faCamera
} from '@fortawesome/free-solid-svg-icons';

import { profileService, validationUtils, fileUtils } from '../services/profileService';
import './Projects.css';

/**
 * Projects Component
 * Manages user's project portfolio with full CRUD operations
 */
const Projects = ({ onUpdate }) => {
  // State management
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    project_url: '',
    github_url: '',
    start_date: '',
    end_date: '',
    is_current: false,
    project_type: 'personal'
  });

  // Image upload state
  const [projectImage, setProjectImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});

  // Project type options
  const projectTypes = [
    { value: 'personal', label: 'Personal Project' },
    { value: 'academic', label: 'Academic Project' },
    { value: 'professional', label: 'Professional Project' },
    { value: 'open-source', label: 'Open Source' },
    { value: 'hackathon', label: 'Hackathon' },
    { value: 'freelance', label: 'Freelance' }
  ];

  /**
   * Fetch projects data on component mount
   */
  useEffect(() => {
    fetchProjectsData();
  }, []);

  // Cleanup image previews on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        fileUtils.cleanupPreview(imagePreview);
      }
    };
  }, [imagePreview]);

  /**
   * Fetch projects from API
   */
  const fetchProjectsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await profileService.getProjects();
      setProjects(data);
      
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to load projects data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      technologies: '',
      project_url: '',
      github_url: '',
      start_date: '',
      end_date: '',
      is_current: false,
      project_type: 'personal'
    });
    setValidationErrors({});
    setProjectImage(null);
    setImagePreview(null);
    setImageFile(null);
    setIsAdding(false);
    setEditingId(null);
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Project title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Project description is required';
    }
    
    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
      }

    if (!formData.is_current && !formData.end_date) {
      errors.end_date = 'End date is required unless currently working on it';
    }
    
    if (formData.start_date && formData.end_date && !formData.is_current) {
      if (!validationUtils.validateDateRange(formData.start_date, formData.end_date)) {
        errors.end_date = 'End date must be after start date';
      }
    }
    
    // URL validation
    if (formData.project_url && !isValidUrl(formData.project_url)) {
      errors.project_url = 'Please enter a valid URL';
    }
    
    if (formData.github_url && !isValidUrl(formData.github_url)) {
      errors.github_url = 'Please enter a valid GitHub URL';
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
   * Handle image upload
   */
  const handleImageUpload = (file) => {
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
      setProjectImage(file);
      setError(null);
      
    } catch (err) {
      console.error('Error handling image upload:', err);
      setError('Failed to process image. Please try again.');
    }
  };

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  /**
   * Remove project image
   */
  const removeProjectImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      fileUtils.cleanupPreview(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
    setProjectImage(null);
  };

  /**
   * Handle adding new project
   */
  const handleAdd = async () => {
    try {
      if (!validateForm()) {
        setError('Please fix the validation errors before saving.');
        return;
      }

      setIsSaving(true);
      setError(null);
      
      const projectData = {
        ...formData,
        end_date: formData.is_current ? null : formData.end_date,
        technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech)
      };
      
      const newProject = await profileService.addProject(projectData, imageFile);
      
      setProjects(prev => [...prev, newProject]);
      resetForm();
      setSuccess('Project added successfully!');
      
      if (onUpdate) {
        onUpdate('projects', newProject);
      }
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error adding project:', err);
      setError(err.message || 'Failed to add project');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle updating existing project
   */
  const handleUpdate = async () => {
    try {
      if (!validateForm()) {
        setError('Please fix the validation errors before saving.');
        return;
      }

      setIsSaving(true);
      setError(null);
      
      const projectData = {
        ...formData,
        end_date: formData.is_current ? null : formData.end_date,
        technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech)
      };
      
      const updatedProject = await profileService.updateProject(editingId, projectData, imageFile);
      
      setProjects(prev => 
        prev.map(project => project.id === editingId ? updatedProject : project)
      );
      
      resetForm();
      setSuccess('Project updated successfully!');
      
      if (onUpdate) {
        onUpdate('projects', updatedProject);
      }
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.message || 'Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle deleting project
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      await profileService.deleteProject(id);
      
      setProjects(prev => prev.filter(project => project.id !== id));
      setSuccess('Project deleted successfully!');
      
      if (onUpdate) {
        onUpdate('projects', { deleted: id });
      }
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err.message || 'Failed to delete project');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Start editing a project
   */
  const startEditing = (project) => {
    setFormData({
      title: project.title || '',
      description: project.description || '',
      technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || '',
      project_url: project.project_url || '',
      github_url: project.github_url || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      is_current: !project.end_date,
      project_type: project.project_type || 'personal'
    });
    
    // Handle existing project image
    if (project.project_image_url) {
      setImagePreview(project.project_image_url);
      setProjectImage(project.project_image_url);
      setImageFile(null); // No new file selected
    } else {
      setImagePreview(null);
      setProjectImage(null);
      setImageFile(null);
    }
    
    setEditingId(project.id);
    setIsAdding(false);
  };

  /**
   * Start adding new project
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
      month: 'short' 
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner" />
        <p>Loading projects data...</p>
      </div>
    );
  }

  return (
    <div className="projects-section">
      {/* Header */}
      <div className="section-header">
        <h2>Projects</h2>
        <p>Showcase your technical projects and achievements</p>
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

      {/* Projects Grid */}
      <div className="projects-grid">
        {projects.length === 0 && !isAdding ? (
          <div className="empty-state">
            <p>No projects yet. Add your first project to showcase your skills!</p>
            <button className="btn-primary" onClick={startAdding}>
              <FontAwesomeIcon icon={faPlus} />
              Add Project
            </button>
          </div>
        ) : (
          <>
            {/* Existing Projects */}
            {projects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <div className="project-title">
                    <h3>{project.title}</h3>
                    <span className="project-type">
                      {projectTypes.find(type => type.value === project.project_type)?.label || project.project_type}
                    </span>
                  </div>
                  <div className="project-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => startEditing(project)}
                      disabled={isSaving}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="btn-icon danger"
                      onClick={() => handleDelete(project.id)}
                      disabled={isSaving}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                
                <div className="project-content">
                  {/* Project Image */}
                  {project.project_image_url && (
                    <img 
                      src={project.project_image_url} 
                      alt={`${project.title} screenshot`}
                      className="project-image"
                    />
                  )}
                  
                  <p className="project-description">{project.description}</p>
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="project-technologies">
                      <FontAwesomeIcon icon={faCode} />
                      <div className="tech-tags">
                        {Array.isArray(project.technologies) 
                          ? project.technologies.map((tech, index) => (
                              <span key={index} className="tech-tag">{tech}</span>
                            ))
                          : project.technologies.split(',').map((tech, index) => (
                              <span key={index} className="tech-tag">{tech.trim()}</span>
                            ))
                        }
                      </div>
                    </div>
                  )}
                  
                  <div className="project-meta">
                    <div className="meta-item">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>
                        {formatDate(project.start_date)} - {project.is_current ? 'Present' : formatDate(project.end_date)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="project-links">
                    {project.project_url && (
                      <a 
                        href={project.project_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="project-link"
                      >
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                        Live Demo
                      </a>
                    )}
                    {project.github_url && (
                      <a 
                        href={project.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="project-link"
                      >
                        <FontAwesomeIcon icon={faCode} />
                        Source Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Button */}
            {!isAdding && (
              <button className="btn-add" onClick={startAdding}>
                <FontAwesomeIcon icon={faPlus} />
                Add Project
              </button>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
      <div className="project-form">
          <div className="form-header">
            <h3>{editingId ? 'Edit Project' : 'Add Project'}</h3>
            <button className="btn-icon" onClick={handleCancel}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="form-content">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">
                  Project Title *
                  {validationErrors.title && (
                    <span className="error-text">{validationErrors.title}</span>
                  )}
                </label>
          <input
                  id="title"
                  name="title"
            type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Project name"
                  className={validationErrors.title ? 'error' : ''}
          />
        </div>

              <div className="form-group">
                <label htmlFor="project_type">Project Type</label>
                <select
                  id="project_type"
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleInputChange}
                >
                  {projectTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project Image Upload */}
            <div className="form-group">
              <label htmlFor="project_image">Project Image</label>
              <div className="image-upload-container">
                {imagePreview ? (
                  <div className="image-preview-container">
                    <img 
                      src={imagePreview} 
                      alt="Project preview" 
                      className="project-image-preview"
                    />
                    <button 
                      type="button"
                      className="remove-image-btn"
                      onClick={removeProjectImage}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ) : (
                  <div className="image-upload-placeholder">
                    <FontAwesomeIcon icon={faCamera} />
                    <p>Click to upload project screenshot</p>
                    <span>Supports: JPG, PNG, GIF (max 5MB)</span>
                  </div>
                )}
                <input
                  id="project_image"
                  name="project_image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="image-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description *
                {validationErrors.description && (
                  <span className="error-text">{validationErrors.description}</span>
                )}
              </label>
          <textarea
                id="description"
            name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your project, its features, and your role..."
                rows={4}
                className={validationErrors.description ? 'error' : ''}
              />
            </div>

            <div className="form-group">
              <label htmlFor="technologies">Technologies Used</label>
              <input
                id="technologies"
                name="technologies"
                type="text"
                value={formData.technologies}
                onChange={handleInputChange}
                placeholder="e.g., React, Node.js, Python, AWS (comma-separated)"
          />
        </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="project_url">
                  Live Demo URL
                  {validationErrors.project_url && (
                    <span className="error-text">{validationErrors.project_url}</span>
                  )}
                </label>
          <input
                  id="project_url"
                  name="project_url"
                  type="url"
                  value={formData.project_url}
                  onChange={handleInputChange}
                  placeholder="https://your-project.com"
                  className={validationErrors.project_url ? 'error' : ''}
          />
        </div>

              <div className="form-group">
                <label htmlFor="github_url">
                  GitHub URL
                  {validationErrors.github_url && (
                    <span className="error-text">{validationErrors.github_url}</span>
                  )}
                </label>
                <input
                  id="github_url"
                  name="github_url"
                  type="url"
                  value={formData.github_url}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/repo"
                  className={validationErrors.github_url ? 'error' : ''}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">
                  Start Date *
                  {validationErrors.start_date && (
                    <span className="error-text">{validationErrors.start_date}</span>
                  )}
                </label>
          <input
                  id="start_date"
                  name="start_date"
            type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className={validationErrors.start_date ? 'error' : ''}
          />
        </div>

              <div className="form-group">
                <label htmlFor="end_date">
                  End Date
                  {validationErrors.end_date && (
                    <span className="error-text">{validationErrors.end_date}</span>
                  )}
                </label>
          <input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  disabled={formData.is_current}
                  className={validationErrors.end_date ? 'error' : ''}
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
                  Currently working on this project
          </label>
        </div>
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
                    {editingId ? 'Update' : 'Add'} Project
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

export default Projects;
