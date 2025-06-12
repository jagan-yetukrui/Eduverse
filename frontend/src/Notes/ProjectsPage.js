import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import nodeProjectsData from './node_projects_complete.json';
import reactProjectsData from './react_projects_complete.json';
import { pythonProjects, javaProjects, awsProjects, sqlProjects } from './ProjectsData';
import './ProjectsPage.css';

const ProjectsPage = () => {
  const { skill } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  // Check if we're viewing project details
  useEffect(() => {
    if (location.pathname === '/projects/details' && location.state?.project) {
      setSelectedProject(location.state.project);
    }
  }, [location]);

  // Load projects based on skill
  useEffect(() => {
    if (skill) {
      const loadProjects = () => {
        switch (skill.toLowerCase()) {
          case 'python':
            setProjects(pythonProjects);
            break;
          case 'java':
            setProjects(javaProjects);
            break;
          case 'react':
            setProjects(reactProjectsData.projects);
            break;
          case 'node.js':
            setProjects(nodeProjectsData.projects);
            break;
          case 'sql':
            setProjects(sqlProjects);
            break;
          case 'aws':
            setProjects(awsProjects);
            break;
          default:
            setProjects([]);
        }
      };
      loadProjects();
    }
  }, [skill]);

  const handleProjectSelect = (project) => {
    // Store project in localStorage for persistence
    localStorage.setItem('selectedProject', JSON.stringify({
      project,
      skillType: skill.toLowerCase()
    }));
    
    // Navigate to the steps page with the project data
    navigate(`/projects/${project.id || project.project_id}/steps`, {
      state: { 
        project,
        skillType: skill.toLowerCase()
      }
    });
  };

  // If we're viewing project details
  if (selectedProject) {
    return (
      <div className="project-details-page">
        <button 
          className="back-btn"
          onClick={() => {
            setSelectedProject(null);
            navigate(-1);
          }}
        >
          ← Back to Projects
        </button>
        
        <div className="project-details">
          <h1>{selectedProject.name || selectedProject.project_name}</h1>
          <div className={`badge ${selectedProject.difficulty?.toLowerCase() || 'beginner'}`}>
            {selectedProject.difficulty || 'Beginner'}
          </div>
          <p className="project-description">{selectedProject.description}</p>
          
          <div className="tasks-section">
            <h2>Tasks</h2>
            {selectedProject.tasks?.map((task, index) => (
              <div key={task.task_id || index} className="task-card">
                <h3>{task.task_name}</h3>
                <p>{task.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Project listing view
  return (
    <div className="projects-wrapper">
      <div className="projects-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/project-suggestions')}
        >
          ← Back to Domains
        </button>
        
        <h1 className="projects-title">👑 {skill} Projects</h1>
        <p className="projects-subtitle">
          Start your quest — build, learn, and level up with real-world challenges!
        </p>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <div 
            key={project.id || project.project_id}
            className="project-card"
            onClick={() => handleProjectSelect(project)}
          >
            <div className="project-card-top">
              <h3>{project.name || project.project_name}</h3>
              <span className={`badge ${project.difficulty?.toLowerCase() || 'beginner'}`}>
                {project.difficulty === 'Beginner' && '🌱'}
                {project.difficulty === 'Intermediate' && '⚔️'}
                {project.difficulty === 'Advanced' && '🔥'}
                {project.difficulty || 'Beginner'}
              </span>
            </div>
            <p className="project-description">{project.description}</p>
            <div className="project-meta">
              <span>🎯 {project.tasks?.length || 0} Tasks Await</span>
              <button className="start-btn">
                🚀 Start Quest
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
