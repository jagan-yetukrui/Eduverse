import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { awsProjects, javaProjects, nodeProjects, pythonProjects, reactProjects, sqlProjects } from './ProjectsData';
import './Steps.css';

// Custom hook for managing game progress
const useGameProgress = () => {
  const [xpEarned, setXpEarned] = useState(0);
  const [streakCount, setStreakCount] = useState(parseInt(localStorage.getItem('codeStreak') || 0));
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState('');

  // Save streak to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('codeStreak', streakCount.toString());
  }, [streakCount]);

  const increaseStreak = () => {
    const newStreakCount = streakCount + 1;
    setStreakCount(newStreakCount);
    
    // Check for achievements
    if (newStreakCount === 3) {
      setAchievementMessage("🔥 Coding Streak: 3 steps completed in a row!");
      setShowAchievement(true);
      setTimeout(() => setShowAchievement(false), 5000);
      return true;
    } else if (newStreakCount === 10) {
      setAchievementMessage("🏆 Coding Master: 10 steps completed in a row!");
      setShowAchievement(true);
      setTimeout(() => setShowAchievement(false), 5000);
      return true;
    }
    return false;
  };

  const decreaseStreak = () => {
    const newStreakCount = Math.max(0, streakCount - 1);
    setStreakCount(newStreakCount);
  };

  const awardXP = (amount) => {
    setXpEarned(prev => prev + amount);
  };

  return {
    xpEarned,
    streakCount,
    showAchievement,
    achievementMessage,
    increaseStreak,
    decreaseStreak,
    awardXP,
    setShowAchievement
  };
};

// Step component to display individual step cards
// eslint-disable-next-line no-unused-vars
const StepCard = ({ step, isSelected, onSelect, onComplete, currentStatus, onRetry }) => {
  const stepProgress = step.isCompleted ? 100 : (step.progress || 0);
  
  return (
    <li 
      className={`step-card ${isSelected ? 'selected' : ''} 
                 ${step.isCompleted ? 'completed' : ''} 
                 ${currentStatus === 'processing' ? 'processing' : ''}
                 ${currentStatus === 'failed' ? 'failed' : ''}`}
      onClick={() => onSelect(step)}
    >
      <div className="step-header">
        <div className="step-title">
          {step.isCompleted ? '✓ ' : 
           currentStatus === 'processing' ? '⏳ ' :
           currentStatus === 'failed' ? '❌ ' : '⚡ '}
          {step.step_name}
        </div>
        {step.isCompleted && <span className="step-xp">+{step.xpValue || 10} XP</span>}
      </div>
      
      {isSelected && (
        <div className="step-card-details">
          <div className="step-description">{step.description}</div>
          
          {step.guidelines && (
            <div className="step-instructions">
              <h4 className="instructions-title">Mission Briefing:</h4>
              <ul className="guidelines-list">
                {Array.isArray(step.guidelines) ? 
                  step.guidelines.map((guideline, index) => (
                    <li key={index} className="guideline-item">
                      <span className="guideline-bullet">•</span> {guideline}
                    </li>
                  )) : 
                  <div className="instruction-content">{step.guidelines}</div>
                }
              </ul>
            </div>
          )}
          
          <div className="step-actions">
            {currentStatus === 'failed' && (
              <button className="complete-button" onClick={onRetry}>
                Retry Mission
              </button>
            )}
            
            <button 
              className={`complete-button ${step.isCompleted ? 'completed' : ''} 
                        ${currentStatus === 'processing' ? 'processing' : ''}`}
              onClick={onComplete}
              disabled={step.isCompleted || currentStatus === 'processing'}
            >
              {step.isCompleted ? '✓ Mission Accomplished' : 
               currentStatus === 'processing' ? 'Processing...' : 
               `Complete Mission (+${step.xpValue || 10} XP)`}
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

// Main Steps component
const Steps = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [projectsData, setProjectsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  
  // Use our custom hook for game progress
  const { 
    xpEarned, 
    streakCount, 
    showAchievement, 
    achievementMessage, 
    increaseStreak, 
    decreaseStreak, 
    awardXP
  } = useGameProgress();
  
  const audioRef = useRef({});

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(`project_${projectId}_state`);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.lastTaskId && parsedState.lastStepId) {
          localStorage.setItem('resumeState', JSON.stringify({
            taskId: parsedState.lastTaskId,
            stepId: parsedState.lastStepId
          }));
        }
      } catch (error) {
        console.error('Error parsing saved state:', error);
      }
    }
  }, [projectId]);

  // Fetch project data from JSON file
  const fetchProjectData = useCallback(async () => {
    try {
      // Determine which JSON file to fetch based on project ID prefix
      let projectsArray;
      let jsonData;
      
      if (projectId.startsWith('J')) {
        projectsArray = javaProjects;
        jsonData = await import('./java_projects_complete.json');
      } else if (projectId.startsWith('P')) {
        projectsArray = pythonProjects;
        jsonData = await import('./python_projects_complete.json');
      } else if (projectId.startsWith('AWS')) {
        projectsArray = awsProjects;
        jsonData = await import('./aws_projects_complete.json');
      } else if (projectId.startsWith('S')) {
        projectsArray = sqlProjects;
        jsonData = await import('./sql_projects_complete.json');
      } else if (projectId.startsWith('N')) {
        projectsArray = nodeProjects;
        jsonData = await import('./node_projects_complete.json');
      } else if (projectId.startsWith('R')) {
        projectsArray = reactProjects;
        jsonData = await import('./react_projects_complete.json');
      } else {
        // Default to Python if no match
        projectsArray = pythonProjects;
        jsonData = await import('./python_projects_complete.json');
      }
      
      setProjectsData(jsonData.projects);
      
      // Find the project based on the projectId from URL params
      const foundProject = projectsArray.find(p => (p.id || p.project_id) === projectId);

      
      if (foundProject) {
        setProject(foundProject);
        
        // Get detailed project data if available
        const detailedProject = jsonData.projects.find(p => (p.id || p.project_id) === projectId);

        
        // Check if we should resume from a saved state
        const resumeState = localStorage.getItem('resumeState');
        if (resumeState) {
          try {
            const { taskId, stepId } = JSON.parse(resumeState);
            
            // Find the task and step to resume from
            const resumeTask = foundProject.tasks.find(task => task.task_id === taskId);
            if (resumeTask && resumeTask.isUnlocked) {
              // Enhance task with detailed data if available
              let enhancedTask = {...resumeTask};
              if (detailedProject) {
                const detailedTask = detailedProject.tasks.find(t => t.task_id === resumeTask.task_id);
                if (detailedTask) {
                  enhancedTask = {...enhancedTask, ...detailedTask};
                }
              }
              setSelectedTask(enhancedTask);
              
              // Find the step to resume from
              const resumeStep = resumeTask.steps.find(step => step.step_id === stepId);
              if (resumeStep && resumeStep.isUnlocked) {
                // Enhance step with detailed data if available
                let enhancedStep = {...resumeStep};
                if (detailedProject) {
                  const detailedTask = detailedProject.tasks.find(t => t.task_id === resumeTask.task_id);
                  if (detailedTask) {
                    const detailedStep = detailedTask.steps.find(s => s.step_id === resumeStep.step_id);
                    if (detailedStep) {
                      enhancedStep = {...enhancedStep, ...detailedStep};
                    }
                  }
                }
                setSelectedStep(enhancedStep);
                
                // Show notification that we resumed
                showNotification('Resumed from your last session', 'info');
                
                setLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error('Error parsing resume state:', error);
          }
        }
        
        // Default: Set the first unlocked task as selected
        const firstUnlockedTask = foundProject.tasks.find(task => task.isUnlocked);
        if (firstUnlockedTask) {
          // Enhance task with detailed data if available
          let enhancedTask = {...firstUnlockedTask};
          if (detailedProject) {
            const detailedTask = detailedProject.tasks.find(t => t.task_id === firstUnlockedTask.task_id);
            if (detailedTask) {
              enhancedTask = {...enhancedTask, ...detailedTask};
            }
          }
          setSelectedTask(enhancedTask);
          
          // Set the first unlocked step as selected by default
          const firstUnlockedStep = firstUnlockedTask.steps.find(step => step.isUnlocked);
          if (firstUnlockedStep) {
            // Enhance step with detailed data if available
            let enhancedStep = {...firstUnlockedStep};
            if (detailedProject) {
              const detailedTask = detailedProject.tasks.find(t => t.task_id === firstUnlockedTask.task_id);
              if (detailedTask) {
                const detailedStep = detailedTask.steps.find(s => s.step_id === firstUnlockedStep.step_id);
                if (detailedStep) {
                  enhancedStep = {...enhancedStep, ...detailedStep};
                }
              }
            }
            setSelectedStep(enhancedStep);
          }
        }
      } else {
        // Redirect to projects page if project not found
        navigate('/projects');
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
      
      // Fallback to using the data from ProjectsData.js
      const isJavaProject = projectId.startsWith('J');
      const projectsArray = isJavaProject ? javaProjects : pythonProjects;
      const foundProject = projectsArray.find(p => p.id === projectId);
      
      if (foundProject) {
        setProject(foundProject);
        
        const firstUnlockedTask = foundProject.tasks.find(task => task.isUnlocked);
        if (firstUnlockedTask) {
          setSelectedTask(firstUnlockedTask);
          
          const firstUnlockedStep = firstUnlockedTask.steps.find(step => step.isUnlocked);
          if (firstUnlockedStep) {
            setSelectedStep(firstUnlockedStep);
          }
        }
      } else {
        navigate('/projects');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate]);

  // Initialize audio and load project data
  useEffect(() => {
    // Initialize audio for sound effects
    audioRef.current = {
      complete: new Audio('/sounds/complete.mp3'),
      unlock: new Audio('/sounds/unlock.mp3'),
      achievement: new Audio('/sounds/achievement.mp3'),
      error: new Audio('/sounds/error.mp3')
    };
    
    // Preload audio files
    Object.values(audioRef.current).forEach(audio => {
      audio.load();
    });
    
    // Check if we have project data from navigation state
    if (location.state && location.state.project) {
      setProject(location.state.project);
      
      if (location.state.activeTask) {
        setSelectedTask(location.state.activeTask);
        
        if (location.state.activeStep) {
          setSelectedStep(location.state.activeStep);
        }
      }
      setLoading(false);
    } else {
      // Fetch project data
      fetchProjectData();
    }

    // Cleanup function
    return () => {
      Object.values(audioRef.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [projectId, navigate, location, fetchProjectData]);

  // Save current state to localStorage whenever selected task or step changes
  useEffect(() => {
    if (selectedTask && selectedStep) {
      localStorage.setItem(`project_${projectId}_state`, JSON.stringify({
        lastTaskId: selectedTask.task_id,
        lastStepId: selectedStep.step_id
      }));
    }
  }, [projectId, selectedTask, selectedStep]);

  // Helper function to show notifications
  const showNotification = (message, type = 'info') => {
    setNotification({
      show: true,
      message,
      type
    });
    setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 3000);
  };

  // Handle task selection
  const handleTaskSelect = (task) => {
    // Get enhanced task data from detailed JSON if available
    let enhancedTask = {...task};
    if (projectsData.length > 0) {
      const detailedProject = projectsData.find(p => p.project_id === projectId);
      if (detailedProject) {
        const detailedTask = detailedProject.tasks.find(t => t.task_id === task.task_id);
        if (detailedTask) {
          enhancedTask = {...enhancedTask, ...detailedTask};
        }
      }
    }
    setSelectedTask(enhancedTask);
    
    // Select the first step in the task
    const firstStep = task.steps[0];
    if (firstStep) {
      handleStepSelect(firstStep);
    }
  };

  // Handle step selection
  const handleStepSelect = (step) => {
    // Get enhanced step data from detailed JSON if available
    let enhancedStep = {...step};
    if (projectsData.length > 0 && selectedTask) {
      const detailedProject = projectsData.find(p => p.project_id === projectId);
      if (detailedProject) {
        const detailedTask = detailedProject.tasks.find(t => t.task_id === selectedTask.task_id);
        if (detailedTask) {
          const detailedStep = detailedTask.steps.find(s => s.step_id === step.step_id);
          if (detailedStep) {
            enhancedStep = {...enhancedStep, ...detailedStep};
          }
        }
      }
    }
    setSelectedStep(enhancedStep);
  };

  // Helper function to mark a step as complete
  const markStepComplete = (projectId, taskId, stepId) => {
    // Determine if it's a Java or Python project
    const isJavaProject = projectId.startsWith('J');
    const projectsArray = isJavaProject ? javaProjects : pythonProjects;
    
    // Find the project
    const projectIndex = projectsArray.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return false;
    
    // Find the task
    const taskIndex = projectsArray[projectIndex].tasks.findIndex(t => t.task_id === taskId);
    if (taskIndex === -1) return false;
    
    // Find the step
    const stepIndex = projectsArray[projectIndex].tasks[taskIndex].steps.findIndex(s => s.step_id === stepId);
    if (stepIndex === -1) return false;
    
    // Mark the step as completed
    projectsArray[projectIndex].tasks[taskIndex].steps[stepIndex].isCompleted = true;
    
    // Update project XP
    const stepXP = projectsArray[projectIndex].tasks[taskIndex].steps[stepIndex].xpValue || 10;
    projectsArray[projectIndex].xpGained += stepXP;
    
    // Calculate progress percentage
    const totalSteps = projectsArray[projectIndex].tasks.reduce((acc, task) => acc + task.steps.length, 0);
    const completedSteps = projectsArray[projectIndex].tasks.reduce((acc, task) => 
      acc + task.steps.filter(step => step.isCompleted).length, 0);
    
    projectsArray[projectIndex].questProgress = Math.round((completedSteps / totalSteps) * 100);
    
    return true;
  };

  // Helper function to unlock the next step
  const unlockNextStep = (projectId, taskId, stepId) => {
    // Determine if it's a Java or Python project
    const isJavaProject = projectId.startsWith('J');
    const projectsArray = isJavaProject ? javaProjects : pythonProjects;
    
    // Find the project
    const projectIndex = projectsArray.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return false;
    
    // Find the task
    const taskIndex = projectsArray[projectIndex].tasks.findIndex(t => t.task_id === taskId);
    if (taskIndex === -1) return false;
    
    // Find the step
    const stepIndex = projectsArray[projectIndex].tasks[taskIndex].steps.findIndex(s => s.step_id === stepId);
    if (stepIndex === -1) return false;
    
    // Check if there's a next step in the same task
    if (stepIndex < projectsArray[projectIndex].tasks[taskIndex].steps.length - 1) {
      // Unlock the next step in the same task
      projectsArray[projectIndex].tasks[taskIndex].steps[stepIndex + 1].isUnlocked = true;
    } else {
      // This was the last step in the task, mark the task as completed
      projectsArray[projectIndex].tasks[taskIndex].isCompleted = true;
      
      // Check if there's a next task to unlock
      if (taskIndex < projectsArray[projectIndex].tasks.length - 1) {
        // Unlock the next task
        projectsArray[projectIndex].tasks[taskIndex + 1].isUnlocked = true;
        
        // Unlock the first step of the next task
        if (projectsArray[projectIndex].tasks[taskIndex + 1].steps.length > 0) {
          projectsArray[projectIndex].tasks[taskIndex + 1].steps[0].isUnlocked = true;
        }
      }
    }
    
    return true;
  };

  // Handle step completion
  const handleStepComplete = () => {
    if (selectedTask && selectedStep) {
      // Simulate processing delay
      setTimeout(() => {
        // Simulate success/failure based on some condition
        const isSuccessful = Math.random() > 0.2; // 80% success rate
        
        if (isSuccessful) {
          const success = markStepComplete(projectId, selectedTask.task_id, selectedStep.step_id);
          if (success) {
            // Play completion sound
            if (audioRef.current && audioRef.current.complete) {
              audioRef.current.complete.play().catch(e => console.log('Audio play error:', e));
            }
            
            // Update streak and check for achievements
            const achievementUnlocked = increaseStreak();
            if (achievementUnlocked && audioRef.current && audioRef.current.achievement) {
              audioRef.current.achievement.play().catch(e => console.log('Audio play error:', e));
            }
            
            // Show confetti and XP earned animation
            awardXP(selectedStep.xpValue || 10);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
            
            // Unlock the next step
            unlockNextStep(projectId, selectedTask.task_id, selectedStep.step_id);
            
            // Play unlock sound for next step
            if (audioRef.current && audioRef.current.unlock) {
              audioRef.current.unlock.play().catch(e => console.log('Audio play error:', e));
            }
            
            // Determine if it's a Java or Python project
            const isJavaProject = projectId.startsWith('J');
            const projectsArray = isJavaProject ? javaProjects : pythonProjects;
            
            // Refresh project data
            const updatedProject = projectsArray.find(p => p.id === projectId);
            setProject(updatedProject);
            
            // Update selected task and step with the latest data
            const updatedTask = updatedProject.tasks.find(t => t.task_id === selectedTask.task_id);
            setSelectedTask(updatedTask);
            
            const updatedStep = updatedTask.steps.find(s => s.step_id === selectedStep.step_id);
            setSelectedStep(updatedStep);
            
            // Show success notification
            showNotification('Mission accomplished! Next step unlocked.', 'success');
          }
        } else {
          // Play error sound
          if (audioRef.current && audioRef.current.error) {
            audioRef.current.error.play().catch(e => console.log('Audio play error:', e));
          }
          
          // Decrease streak
          decreaseStreak();
          
          // Show failure notification
          showNotification('Mission failed. Try again!', 'error');
        }
      }, 1500);
    }
  };

  // Navigate back to projects page
  const handleBackClick = () => {
    // Get the skill type from state or localStorage
    const skillType = location.state?.skillType || 
                     JSON.parse(localStorage.getItem('selectedProject'))?.skillType;
    
    if (skillType) {
      // Clear the selected project from localStorage to prevent navigation loops
      localStorage.removeItem('selectedProject');
      // Navigate to the projects page for the specific skill
      navigate(`/projects/${skillType}`);
    } else {
      // If no skill type is found, go to project suggestions
      navigate('/project-suggestions');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <h2>Loading your coding adventure...</h2>
        <p>Preparing your quest, please wait...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="error-screen">
        <h2>Quest not found!</h2>
        <p>The coding adventure you're looking for seems to be missing.</p>
        <button className="back-button" onClick={handleBackClick}>Return to Quests</button>
      </div>
    );
  }

  return (
    <div className="steps-container">
      {showConfetti && (
        <div className="confetti-container">
          <div className="confetti"></div>
          <div className="confetti"></div>
          <div className="confetti"></div>
          <div className="confetti"></div>
          <div className="confetti"></div>
          <div className="xp-earned">+{xpEarned} XP</div>
        </div>
      )}
      
      {showAchievement && (
        <div className="achievement-popup">
          <div className="achievement-icon">🏆</div>
          <div className="achievement-text">{achievementMessage}</div>
        </div>
      )}
      
      {notification.show && (
        <div className={`notification-popup ${notification.type}`}>
          <div className="notification-icon">
            {notification.type === 'success' ? '✅' : 
             notification.type === 'error' ? '❌' : 
             notification.type === 'warning' ? '⚠️' : 'ℹ️'}
          </div>
          <div className="notification-text">{notification.message}</div>
        </div>
      )}
      
      <div className="project-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBackClick}>← Back</button>
          <h1 className="project-title">{project.name}</h1>
        </div>

        <div className="header-right">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${project.questProgress}%` }}
            ></div>
          </div>
          <div className="xp-streak">
            <div className="xp-badge">
              <span className="xp-icon">⭐</span>
              <span>XP: {project.xpGained}</span>
            </div>
            <div className="streak-counter">
              <span className="streak-icon">🔥</span>
              <span>Streak: {streakCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="content-area">
        <div className="tasks-sidebar">
          <h2 className="sidebar-title">Quest Tasks</h2>
          <ul className="tasks-list">
            {project.tasks.map((task) => (
              <li 
                key={task.task_id}
                className={`task-item ${task.isUnlocked ? 'unlocked' : 'locked'} 
                           ${selectedTask && task.task_id === selectedTask.task_id ? 'selected' : ''} 
                           ${task.isCompleted ? 'completed' : ''}`}
                onClick={() => handleTaskSelect(task)}
              >
                <div className="task-title">
                  {task.isCompleted ? '✓ ' : task.isUnlocked ? '⚔️ ' : '🔒 '}{task.task_name}
                </div>
                {task.isCompleted && <span className="task-badge">Completed</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="steps-content">
          {selectedTask && (
            <>
              <div className="task-details">
                <h2 className="task-title">{selectedTask.task_name}</h2>
                <p className="quest-description">{selectedTask.description}</p>
                {selectedTask.objectives && (
                  <div className="task-objectives">
                    <h4 className="objectives-title">Mission Objectives:</h4>
                    <ul className="objectives-list">
                      {selectedTask.objectives.map((objective, index) => (
                        <li key={index} className="objective-item">
                          <span className="objective-icon">🎯</span> {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="steps-list">
                <h3 className="steps-title">Mission Steps</h3>
                <ul className="step-cards">
                  {selectedTask.steps.map((step) => (
                    <StepCard
                      key={step.step_id}
                      step={step}
                      isSelected={selectedStep && step.step_id === selectedStep.step_id}
                      onSelect={handleStepSelect}
                      onComplete={handleStepComplete}
                      currentStatus={step.status}
                      onRetry={() => handleStepComplete(step)}
                    />
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Steps;
