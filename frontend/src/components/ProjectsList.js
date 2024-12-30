import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { FaPlus, FaStar, FaCodeBranch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { format } from 'date-fns';

const ProjectsList = ({ userId }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `http://127.0.0.1:8000/api/projects/user/${userId}?sort=${sortBy}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setProjects(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId, sortBy]);

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h2>Projects</h2>
        <div className="projects-controls">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Most Recent</option>
            <option value="stars">Most Stars</option>
            <option value="forks">Most Forks</option>
          </select>
          <button 
            onClick={handleCreateProject}
            className="create-project-btn"
          >
            <FaPlus /> New Project
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <p className="no-projects">No projects found</p>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card" onClick={() => navigate(`/projects/${project.id}`)}>
              <div className="project-header">
                <h3>{project.title}</h3>
                <span className="project-date">
                  {format(new Date(project.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              <p className="project-description">{project.description}</p>
              <div className="project-meta">
                <div className="project-stats">
                  <span><FaStar /> {project.stars}</span>
                  <span><FaCodeBranch /> {project.forks}</span>
                </div>
                <div className="project-contributors">
                  {project.contributors.slice(0, 3).map(contributor => (
                    <img 
                      key={contributor.id}
                      src={contributor.avatar}
                      alt={contributor.username}
                      title={contributor.username}
                      className="contributor-avatar"
                    />
                  ))}
                  {project.contributors.length > 3 && (
                    <span className="more-contributors">
                      +{project.contributors.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

ProjectsList.propTypes = {
  userId: PropTypes.string.isRequired
};

export default ProjectsList;
