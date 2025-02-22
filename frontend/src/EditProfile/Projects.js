import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Projects.css';

/**
 * Projects component for managing user's projects and research
 * Allows users to view, add, edit and delete projects from their profile
 */
const Projects = ({ projects: initialProjects, onUpdate }) => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with passed projects data
  useEffect(() => {
    if (initialProjects) {
      setProjects(initialProjects);
    }
  }, [initialProjects]);

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    url: '',
    is_research: false,
    collaborators: []
  });

  /**
   * Handles input changes in the project form
   */
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setNewProject({ ...newProject, [e.target.name]: value });
    setError('');
    setSuccessMessage('');
  };

  /**
   * Handles adding a new project
   */
  const handleAddProject = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Validate required fields
      if (!newProject.title || !newProject.description) {
        setError('Title and description are required');
        return;
      }

      // Validate dates
      if (newProject.end_date && new Date(newProject.end_date) < new Date(newProject.start_date)) {
        setError('End date cannot be before start date');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/profiles/me/projects/',
        newProject,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update state and notify parent
      const updatedProjects = [...projects, response.data];
      setProjects(updatedProjects);
      onUpdate(updatedProjects);
      
      // Reset form
      setNewProject({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        url: '',
        is_research: false,
        collaborators: []
      });
      
      setSuccessMessage('Project added successfully');
    } catch (error) {
      console.error('Error adding project:', error);
      setError(error.response?.data?.message || 'Failed to add project');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles updating an existing project
   */
  const handleUpdateProject = async (id, projectData) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/profiles/me/projects/`,
        { ...projectData, id },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update state and notify parent
      const updatedProjects = projects.map(project => 
        project.id === id ? response.data : project
      );
      setProjects(updatedProjects);
      onUpdate(updatedProjects);
      setSuccessMessage('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      setError(error.response?.data?.message || 'Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles deleting a project
   */
  const handleDeleteProject = async (id) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/profiles/me/projects/`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { id }
      });

      // Update state and notify parent
      const updatedProjects = projects.filter(project => project.id !== id);
      setProjects(updatedProjects);
      onUpdate(updatedProjects);
      setSuccessMessage('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      setError(error.response?.data?.message || 'Failed to delete project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="projects-container">
      <h2>Projects & Research</h2>
      
      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {/* Add Project Form */}
      <div className="project-form">
        <div className="input-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={newProject.title}
            onChange={handleChange}
            placeholder="Project Title"
            required
          />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea
            name="description"
            value={newProject.description}
            onChange={handleChange}
            placeholder="Project Description"
            required
          />
        </div>

        <div className="input-group">
          <label>Start Date</label>
          <input
            type="date"
            name="start_date"
            value={newProject.start_date}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>End Date</label>
          <input
            type="date"
            name="end_date"
            value={newProject.end_date}
            onChange={handleChange}
            min={newProject.start_date}
          />
        </div>

        <div className="input-group">
          <label>Project URL</label>
          <input
            type="url"
            name="url"
            value={newProject.url}
            onChange={handleChange}
            placeholder="Project URL (optional)"
          />
        </div>

        <div className="input-group checkbox">
          <label>
            <input
              type="checkbox"
              name="is_research"
              checked={newProject.is_research}
              onChange={handleChange}
            />
            This is a research project
          </label>
        </div>

        <button 
          onClick={handleAddProject}
          disabled={isLoading}
          className="add-button"
        >
          {isLoading ? 'Adding...' : 'Add Project'}
        </button>
      </div>

      {/* Projects List */}
      <div className="projects-list">
        {projects.map((project) => (
          <div key={project.id} className="project-item">
            <h3>{project.title}</h3>
            <p className="description">{project.description}</p>
            <div className="project-details">
              <p>
                <strong>Duration:</strong> {project.start_date} to {project.end_date || 'Present'}
              </p>
              {project.url && (
                <p>
                  <strong>URL:</strong> <a href={project.url} target="_blank" rel="noopener noreferrer">{project.url}</a>
                </p>
              )}
              <p>
                <strong>Type:</strong> {project.is_research ? 'Research Project' : 'Project'}
              </p>
            </div>
            <div className="button-group">
              <button 
                onClick={() => handleUpdateProject(project.id, project)}
                disabled={isLoading}
                className="edit-button"
              >
                {isLoading ? 'Updating...' : 'Edit'}
              </button>
              <button 
                onClick={() => handleDeleteProject(project.id)}
                disabled={isLoading}
                className="delete-button"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
