import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Projects.css';

/**
 * Projects component for managing user's projects and research
 * Allows users to view, add, edit and delete projects from their profile
 */
const Projects = () => {
  // State management for projects list and form handling
  const [projects, setProjects] = useState([]); // Array of user's projects
  const [newProject, setNewProject] = useState({
    title: '',
    description: '', 
    technologies: '',
    start_date: '',
    end_date: '',
    link: '',
  });
  const [error, setError] = useState(''); // Error message state
  const [successMessage, setSuccessMessage] = useState(''); // Success message state
  const [isLoading, setIsLoading] = useState(false); // Loading state for API operations

  // Fetch projects when component mounts
  useEffect(() => {
    fetchProjects();
  }, []);

  /**
   * Fetches user's projects from the backend API
   * Updates projects state with the response data
   */
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profiles/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again.');
    }
  };

  /**
   * Handles input changes in the project form
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
    setError('');
    setSuccessMessage('');
  };

  /**
   * Handles the addition of a new project
   * Validates input and makes API call to add project
   */
  const handleAddProject = async () => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    // Input validation
    if (!newProject.title.trim() || !newProject.description.trim()) {
      setError('Title and description are required.');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/profiles/add-project/',
        newProject,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update state on successful addition
      setProjects(response.data.projects);
      setNewProject({
        title: '',
        description: '',
        technologies: '',
        start_date: '',
        end_date: '',
        link: '',
      });
      setSuccessMessage('Project added successfully!');
    } catch (error) {
      console.error('Error adding project:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to add project. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the deletion of a project
   * Makes API call to remove project
   * @param {string} projectId - ID of project to delete
   */
  const handleDeleteProject = async (projectId) => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/profiles/delete-project/${projectId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProjects(response.data.projects);
      setSuccessMessage('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="projects-container">
      <h2>Projects & Research</h2>
      
      {/* Project input form */}
      <div className="project-form">
        <input
          type="text"
          name="title"
          value={newProject.title}
          onChange={handleChange}
          placeholder="Project Title"
          required
        />
        <textarea
          name="description"
          value={newProject.description}
          onChange={handleChange}
          placeholder="Project Description"
          required
        />
        <input
          type="text"
          name="technologies"
          value={newProject.technologies}
          onChange={handleChange}
          placeholder="Technologies Used (comma-separated)"
        />
        <input
          type="date"
          name="start_date"
          value={newProject.start_date}
          onChange={handleChange}
        />
        <input
          type="date"
          name="end_date"
          value={newProject.end_date}
          onChange={handleChange}
        />
        <input
          type="url"
          name="link"
          value={newProject.link}
          onChange={handleChange}
          placeholder="Project Link (optional)"
        />
        <button 
          onClick={handleAddProject}
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Project'}
        </button>
      </div>

      {/* Error and success messages */}
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {/* Projects list */}
      <div className="projects-list">
        {projects.map((project) => (
          <div key={project.id} className="project-item">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <p><strong>Technologies:</strong> {project.technologies}</p>
            <p>
              <strong>Duration:</strong> {project.start_date} to {project.end_date}
            </p>
            {project.link && (
              <p>
                <strong>Link:</strong> <a href={project.link} target="_blank" rel="noopener noreferrer">{project.link}</a>
              </p>
            )}
            <button 
              onClick={() => handleDeleteProject(project.id)}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
