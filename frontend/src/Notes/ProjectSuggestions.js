import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pythonProjects } from './ProjectsData';
import './ProjectSuggestions.css';

const ProjectSuggestions = () => {
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState('');

  const projectsBySkill = {
    python: pythonProjects,
    javascript: [
      // Keeping existing JavaScript projects...
    ],
    react: [
      // Keeping existing React projects...  
    ],
    node: [
      // Keeping existing Node projects...
    ],
    sql: [
      // Keeping existing SQL projects...
    ],
    java: [
      // Java projects...
    ],
    cpp: [
      // C++ projects...
    ],
    golang: [
      // Go projects...
    ],
    rust: [
      // Rust projects...
    ],
    typescript: [
      // TypeScript projects...
    ],
    html: [
      // HTML/CSS projects...
    ],
    docker: [
      // Docker projects...
    ],
    aws: [
      // AWS projects...
    ]
  };

  const skillEmojis = {
    python: '🐍',
    javascript: '⚡',
    react: '⚛️',
    node: '🟢',
    sql: '🗄️',
    java: '☕',
    cpp: '⚙️',
    golang: '🐹',
    rust: '🦀',
    typescript: '📘',
    html: '🎨',
    docker: '🐳',
    aws: '☁️'
  };

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
  };

  const handleProjectSelect = (project) => {
    const selectedProject = pythonProjects.find(p => p.id === project.id);
    if (selectedProject) {
      if (selectedProject.tasks.length > 0) {
        selectedProject.tasks[0].isUnlocked = true;
        if (selectedProject.tasks[0].steps.length > 0) {
          selectedProject.tasks[0].steps[0].isUnlocked = true;
        }
      }
      navigate(`/projects/${selectedProject.id}/steps`, {
        state: { 
          project: selectedProject,
          activeTask: selectedProject.tasks[0],
          activeStep: selectedProject.tasks[0]?.steps[0]
        }
      });
    }
  };

  return (
    <div className="project-suggestions">
      <button 
        className="back-button"
        onClick={() => navigate(-1)}
      >
        <span>←</span> Back
      </button>
      
      <h2>🎮 Epic Code Quest: Choose Your Adventure!</h2>
      
      <div className="skill-selector">
        <h3>🌟 Select Your Magical Coding Path 🌟</h3>
        <div className="skill-buttons">
          {Object.keys(projectsBySkill).map((skill) => (
            <button
              key={skill}
              className={`skill-button ${selectedSkill === skill ? 'active' : ''}`}
              onClick={() => handleSkillSelect(skill)}
            >
              <div className="skill-icon">{skillEmojis[skill]}</div>
              <div className="skill-name">{skill.toUpperCase()}</div>
              <div className="skill-sparkle">✨</div>
            </button>
          ))}
        </div>
      </div>

      {selectedSkill && (
        <div className="projects-container">
          <div className="projects-list">
            <h3>🏰 Available Quests 🏰</h3>
            <div className="project-cards">
              {projectsBySkill[selectedSkill].map((project) => (
                <div 
                  key={project.id}
                  className="project-card"
                  onClick={() => handleProjectSelect(project)}
                >
                  <div className="project-card-header">
                    <h4>{project.name}</h4>
                    <div className={`difficulty-badge ${project.difficulty.toLowerCase()}`}>
                      {project.difficulty === 'Beginner' && '🌱'}
                      {project.difficulty === 'Intermediate' && '⚔️'}
                      {project.difficulty === 'Advanced' && '🔥'}
                      {project.difficulty}
                    </div>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tasks-preview">
                    {project.tasks && `🎯 ${project.tasks.length} Epic Tasks Await!`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSuggestions;
