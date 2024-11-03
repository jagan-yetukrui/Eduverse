import React, { useState } from 'react';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: '',
    startDate: '',
    endDate: '',
    link: '',
  });

  const handleChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleAddProject = () => {
    setProjects([...projects, newProject]);
    setNewProject({
      title: '',
      description: '',
      technologies: '',
      startDate: '',
      endDate: '',
      link: '',
    });
  };

  const handleDeleteProject = (index) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    setProjects(updatedProjects);
  };

  return (
    <div className="projects-container">
      <h2>Projects & Research</h2>
      <div className="project-form">
        <input
          type="text"
          name="title"
          value={newProject.title}
          onChange={handleChange}
          placeholder="Project Title"
        />
        <textarea
          name="description"
          value={newProject.description}
          onChange={handleChange}
          placeholder="Project Description"
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
          name="startDate"
          value={newProject.startDate}
          onChange={handleChange}
        />
        <input
          type="date"
          name="endDate"
          value={newProject.endDate}
          onChange={handleChange}
        />
        <input
          type="url"
          name="link"
          value={newProject.link}
          onChange={handleChange}
          placeholder="Project Link (optional)"
        />
        <button onClick={handleAddProject}>Add Project</button>
      </div>
      <div className="projects-list">
        {projects.map((project, index) => (
          <div key={index} className="project-item">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <p><strong>Technologies:</strong> {project.technologies}</p>
            <p>
              <strong>Duration:</strong> {project.startDate} to {project.endDate}
            </p>
            {project.link && (
              <p>
                <strong>Link:</strong> <a href={project.link} target="_blank" rel="noopener noreferrer">{project.link}</a>
              </p>
            )}
            <button onClick={() => handleDeleteProject(index)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
