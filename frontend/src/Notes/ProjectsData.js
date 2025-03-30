import pythonProjectsData from './python_projects_complete.json';
import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './ProjectsData.css';

// Transform raw project data into game-like quest format with starter code
export const pythonProjects = pythonProjectsData.projects.map(project => ({
  id: project.project_id,
  name: project.project_name,
  difficulty: "Beginner",
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

def main():
    # ⌨️ Your code here
    pass

if __name__ == "__main__":
    main()`
    }))
  }))
}));

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const project = pythonProjects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
    }
  }, [projectId]);

  const handleTaskClick = (task) => {
    if (task.isUnlocked) {
      navigate('/steps', { 
        state: { 
          project: selectedProject,
          activeTask: task,
          activeStep: task.steps[0]
        }
      });
    }
  };

  if (!selectedProject) {
    return <div className="projects-container">Loading project details...</div>;
  }

  return (
    <div className="projects-container">
      <div className="project-header">
        <h1 className="project-name">{selectedProject.name}</h1>
        <div className="project-meta">
          <span className="difficulty">🏆 {selectedProject.difficulty}</span>
          <span className="xp-gained">✨ XP: {selectedProject.xpGained}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{width: `${selectedProject.questProgress}%`}}
          />
        </div>
      </div>

      <div className="project-content">
        <div className="tasks-list">
          {selectedProject.tasks.map(task => (
            <div 
              key={task.task_id}
              className={`task-item ${task.isUnlocked ? 'unlocked' : 'locked'}`}
              onClick={() => handleTaskClick(task)}
            >
              <div className="task-header">
                <h3>{task.task_name}</h3>
                <span className="reward">+{task.reward} XP</span>
              </div>
              <div className="task-status">
                {task.isCompleted ? '🌟' : task.isUnlocked ? '⚔️' : '🔒'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;

// Helper functions for managing project state
export const markStepComplete = (projectId, taskId, stepId) => {
  const project = pythonProjects.find(p => p.id === projectId);
  if (!project) return false;

  const task = project.tasks.find(t => t.task_id === taskId);
  if (!task) return false;

  const step = task.steps.find(s => s.step_id === stepId);
  if (!step) return false;

  if (!step.isCompleted) {
    step.isCompleted = true;
    project.xpGained += step.xpValue;
    
    // Update project progress
    const totalSteps = project.tasks.reduce((sum, t) => sum + t.steps.length, 0);
    const completedSteps = project.tasks.reduce((sum, t) => 
      sum + t.steps.filter(s => s.isCompleted).length, 0);
    project.questProgress = Math.floor((completedSteps / totalSteps) * 100);

    // Check if task is completed and unlock next task
    if (task.steps.every(s => s.isCompleted)) {
      task.isCompleted = true;
      const taskIndex = project.tasks.findIndex(t => t.task_id === taskId);
      if (taskIndex < project.tasks.length - 1) {
        project.tasks[taskIndex + 1].isUnlocked = true;
      }
    }
  }
  return true;
};

export const unlockNextStep = (projectId, taskId, currentStepId) => {
  const project = pythonProjects.find(p => p.id === projectId);
  if (!project) return false;

  const task = project.tasks.find(t => t.task_id === taskId);
  if (!task) return false;

  const currentStepIndex = task.steps.findIndex(s => s.step_id === currentStepId);
  if (currentStepIndex === -1 || currentStepIndex >= task.steps.length - 1) return false;

  task.steps[currentStepIndex + 1].isUnlocked = true;
  return true;
};
