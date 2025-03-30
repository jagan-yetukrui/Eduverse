import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pythonProjects, javaProjects } from './ProjectsData';
import awsProjectsData from './aws_projects_complete.json';
import sqlProjectsData from './sql_projects_complete.json';
import nodeProjectsData from './node_projects_complete.json';
import reactProjectsData from './react_projects_complete.json';
import './ProjectSuggestions.css';

const ProjectSuggestions = () => {
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState('');

  // Transform AWS projects data
  const awsProjects = awsProjectsData.projects.map(project => ({
    id: project.project_id,
    name: project.project_name,
    difficulty: project.difficulty || "Beginner",
    description: project.description,
    questProgress: 0,
    xpGained: 0,
    tasks: project.tasks.map(task => ({
      task_id: task.task_id,
      task_name: task.task_name,
      description: task.description,
      isUnlocked: task.task_id === project.tasks[0].task_id, // First task is unlocked
      isCompleted: false,
      reward: Math.floor(Math.random() * 50) + 50,
      steps: task.steps.map(step => ({
        step_id: step.step_id,
        step_name: step.step_name,
        description: step.description,
        guidelines: step.guidelines,
        isCompleted: false,
        isUnlocked: false,
        xpValue: Math.floor(Math.random() * 20) + 10,
        starterCode: `# 🎮 ${step.step_name}
# 📝 Follow the guidelines to complete this step

# AWS CLI or CloudFormation snippet
# TODO: Implement your AWS solution here`
      }))
    }))
  }));

  // Transform SQL projects data
  const sqlProjects = sqlProjectsData.projects.map(project => ({
    id: project.project_id,
    name: project.project_name,
    difficulty: project.difficulty || "Beginner",
    description: project.description,
    questProgress: 0,
    xpGained: 0,
    tasks: project.tasks.map(task => ({
      task_id: task.task_id,
      task_name: task.task_name,
      description: task.description,
      isUnlocked: task.task_id === project.tasks[0].task_id,
      isCompleted: false,
      reward: Math.floor(Math.random() * 50) + 50,
      steps: task.steps.map(step => ({
        step_id: step.step_id,
        step_name: step.step_name,
        description: step.description,
        guidelines: step.guidelines,
        isCompleted: false,
        isUnlocked: false,
        xpValue: Math.floor(Math.random() * 20) + 10,
        starterCode: `-- 🎮 ${step.step_name}
-- 📝 Follow the guidelines to complete this step

-- TODO: Write your SQL query here`
      }))
    }))
  }));

  // Transform Node.js projects data
  const nodeProjects = nodeProjectsData.projects.map(project => ({
    id: project.project_id,
    name: project.project_name,
    difficulty: project.difficulty || "Beginner",
    description: project.description,
    questProgress: 0,
    xpGained: 0,
    tasks: project.tasks.map(task => ({
      task_id: task.task_id,
      task_name: task.task_name,
      description: task.description,
      isUnlocked: task.task_id === project.tasks[0].task_id,
      isCompleted: false,
      reward: Math.floor(Math.random() * 50) + 50,
      steps: task.steps.map(step => ({
        step_id: step.step_id,
        step_name: step.step_name,
        description: step.description,
        guidelines: step.guidelines,
        isCompleted: false,
        isUnlocked: false,
        xpValue: Math.floor(Math.random() * 20) + 10,
        starterCode: `// 🎮 ${step.step_name}
// 📝 Follow the guidelines to complete this step

const express = require('express');
// TODO: Implement your Node.js solution here`
      }))
    }))
  }));

  // Transform React projects data
  const reactProjects = reactProjectsData.projects.map(project => ({
    id: project.project_id,
    name: project.project_name,
    difficulty: project.difficulty || "Beginner",
    description: project.description,
    questProgress: 0,
    xpGained: 0,
    tasks: project.tasks.map(task => ({
      task_id: task.task_id,
      task_name: task.task_name,
      description: task.description,
      isUnlocked: task.task_id === project.tasks[0].task_id,
      isCompleted: false,
      reward: Math.floor(Math.random() * 50) + 50,
      steps: task.steps.map(step => ({
        step_id: step.step_id,
        step_name: step.step_name,
        description: step.description,
        guidelines: step.guidelines,
        isCompleted: false,
        isUnlocked: false,
        xpValue: Math.floor(Math.random() * 20) + 10,
        starterCode: `// 🎮 ${step.step_name}
// 📝 Follow the guidelines to complete this step

import React from 'react';

function MyComponent() {
  // TODO: Implement your React component here
  return (
    <div>
      <h1>Hello React World!</h1>
    </div>
  );
}

export default MyComponent;`
      }))
    }))
  }));

  const projectsBySkill = {
    python: pythonProjects,
    java: javaProjects,
    javascript: [
      // Keeping existing JavaScript projects...
    ],
    react: reactProjects,
    node: nodeProjects,
    sql: sqlProjects,
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
    aws: awsProjects
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
    // Find the selected project from the appropriate dataset
    let selectedProject = null;
    
    // Get the project from the corresponding dataset based on selected skill
    if (projectsBySkill[selectedSkill]) {
      selectedProject = projectsBySkill[selectedSkill].find(p => p.id === project.id);
    }
          
    if (selectedProject) {
      // Unlock the first task and step
      if (selectedProject.tasks.length > 0) {
        selectedProject.tasks[0].isUnlocked = true;
        if (selectedProject.tasks[0].steps.length > 0) {
          selectedProject.tasks[0].steps[0].isUnlocked = true;
        }
      }
      // Navigate to the project steps page with the selected project data
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
              {projectsBySkill[selectedSkill] && projectsBySkill[selectedSkill].map((project) => (
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
