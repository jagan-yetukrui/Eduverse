import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { pythonProjects } from './ProjectsData';
import CodeEditor from './CodeEditor';
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
      className={`step-card game-step-card ${step.isUnlocked ? 'unlocked' : 'locked'} 
                 ${isSelected ? 'selected' : ''} 
                 ${step.isCompleted ? 'completed' : ''} 
                 ${!step.isCompleted && step.isUnlocked ? 'unlocking' : ''}
                 ${currentStatus === 'processing' ? 'processing' : ''}
                 ${currentStatus === 'failed' ? 'failed' : ''}`}
      onClick={() => step.isUnlocked && onSelect(step)}
    >
      <div className="step-header">
        <div className="step-title">
          {step.isCompleted ? '✓ ' : 
           currentStatus === 'processing' ? '⏳ ' :
           currentStatus === 'failed' ? '❌ ' :
           step.isUnlocked ? '⚡ ' : '🔒 '}
          {step.step_name}
        </div>
        {step.isCompleted && <span className="step-xp">+{step.xpValue || 10} XP</span>}
      </div>
      
      <div className="step-progress-bar">
        <div 
          className="step-progress-fill" 
          style={{ width: `${stepProgress}%` }}
        ></div>
      </div>
      
      {isSelected && (
        <div className="step-card-details">
          <div className="step-description futuristic-description">{step.description}</div>
          
          {step.guidelines && (
            <div className="step-instructions game-instructions">
              <h4 className="instructions-title">Mission Briefing:</h4>
              <ul className="guidelines-list">
                {Array.isArray(step.guidelines) ? 
                  step.guidelines.map((guideline, index) => (
                    <li key={index} className="guideline-item">
                      <span className="guideline-bullet">•</span> {guideline.replace(/^\d+\.\s*/, '')}
                    </li>
                  )) : 
                  <div className="instruction-content futuristic-description">{step.guidelines}</div>
                }
              </ul>
            </div>
          )}
          
          {step.expectedOutput && (
            <div className="expected-output game-expected-output">
              <h4 className="output-title">Expected Mission Outcome:</h4>
              <pre className="output-content">{step.expectedOutput}</pre>
            </div>
          )}
          
          <div className="step-actions game-actions">
            {currentStatus === 'failed' && (
              <button className="retry-button neon-button game-button" onClick={onRetry}>
                Retry Mission
              </button>
            )}
            
            <button 
              className={`complete-button neon-button game-button 
                        ${step.isCompleted ? 'completed' : ''} 
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
  const [code, setCode] = useState('');
  const [originalCode, setOriginalCode] = useState('');
  const [projectsData, setProjectsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [codeExecutionOutput, setCodeExecutionOutput] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [stepStatus, setStepStatus] = useState('idle'); // idle, processing, completed, failed
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  // eslint-disable-next-line no-unused-vars
  const [progressAnimation, setProgressAnimation] = useState(false);
  const [codeChanged, setCodeChanged] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [hintsLevel, setHintsLevel] = useState(0);
  
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
  const bottomRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const editorRef = useRef(null);

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
          const startCode = location.state.activeStep.starterCode || '';
          setCode(startCode);
          setOriginalCode(startCode);
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
  }, [projectId, navigate, location]);

  // Fetch project data from JSON file
  const fetchProjectData = async () => {
    try {
      const response = await fetch('/python_projects_complete.json');
      if (!response.ok) {
        throw new Error('Failed to fetch project data');
      }
      const data = await response.json();
      setProjectsData(data.projects);
      
      // Find the project based on the projectId from URL params
      const foundProject = pythonProjects.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
        
        // Get detailed project data if available
        const detailedProject = data.projects.find(p => p.project_id === projectId);
        
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
                
                // Get starting code
                let startCode = '';
                if (detailedProject) {
                  const detailedTask = detailedProject.tasks.find(t => t.task_id === resumeTask.task_id);
                  if (detailedTask) {
                    const detailedStep = detailedTask.steps.find(s => s.step_id === resumeStep.step_id);
                    if (detailedStep && detailedStep.starting_code) {
                      startCode = detailedStep.starting_code;
                    } else {
                      startCode = resumeStep.starterCode || '';
                    }
                  }
                } else {
                  startCode = resumeStep.starterCode || '';
                }
                setCode(startCode);
                setOriginalCode(startCode);
                
                // Clear the resume state after using it
                localStorage.removeItem('resumeState');
                
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
            
            // Get starting code from the detailed JSON if available
            let startCode = '';
            if (detailedProject) {
              const detailedTask = detailedProject.tasks.find(t => t.task_id === firstUnlockedTask.task_id);
              if (detailedTask) {
                const detailedStep = detailedTask.steps.find(s => s.step_id === firstUnlockedStep.step_id);
                if (detailedStep && detailedStep.starting_code) {
                  startCode = detailedStep.starting_code;
                } else {
                  startCode = firstUnlockedStep.starterCode || '';
                }
              } else {
                startCode = firstUnlockedStep.starterCode || '';
              }
            } else {
              startCode = firstUnlockedStep.starterCode || '';
            }
            setCode(startCode);
            setOriginalCode(startCode);
          }
        }
      } else {
        // Redirect to projects page if project not found
        navigate('/projects');
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
      
      // Fallback to using the data from ProjectsData.js
      const foundProject = pythonProjects.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
        
        const firstUnlockedTask = foundProject.tasks.find(task => task.isUnlocked);
        if (firstUnlockedTask) {
          setSelectedTask(firstUnlockedTask);
          
          const firstUnlockedStep = firstUnlockedTask.steps.find(step => step.isUnlocked);
          if (firstUnlockedStep) {
            setSelectedStep(firstUnlockedStep);
            const startCode = firstUnlockedStep.starterCode || '';
            setCode(startCode);
            setOriginalCode(startCode);
          }
        }
      } else {
        navigate('/projects');
      }
    } finally {
      setLoading(false);
    }
  };

  // Save current state to localStorage whenever selected task or step changes
  useEffect(() => {
    if (selectedTask && selectedStep) {
      localStorage.setItem(`project_${projectId}_state`, JSON.stringify({
        lastTaskId: selectedTask.task_id,
        lastStepId: selectedStep.step_id
      }));
    }
  }, [projectId, selectedTask, selectedStep]);

  // Detect code changes
  useEffect(() => {
    if (code !== originalCode) {
      setCodeChanged(true);
    } else {
      setCodeChanged(false);
    }
  }, [code, originalCode]);

  // Scroll to bottom when needed
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedStep, showTerminal, showHints]);

  // Animate progress bar when project progress changes
  useEffect(() => {
    if (project && project.questProgress > 0) {
      setProgressAnimation(true);
      const timer = setTimeout(() => setProgressAnimation(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [project]);

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
    if (task.isUnlocked) {
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
      
      // Select the first unlocked step in the task
      const firstUnlockedStep = task.steps.find(step => step.isUnlocked);
      if (firstUnlockedStep) {
        handleStepSelect(firstUnlockedStep);
      }
    } else {
      // Show notification that task is locked
      const previousTask = project.tasks.find(t => 
        t.order === task.order - 1 || 
        (task.dependencies && task.dependencies.includes(t.task_id))
      );
      
      showNotification(
        previousTask 
          ? `You need to complete "${previousTask.task_name}" first` 
          : "This task is currently locked",
        'warning'
      );
    }
  };

  // Handle step selection
  const handleStepSelect = (step) => {
    if (step.isUnlocked) {
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
      setStepStatus('idle');
      setHintsLevel(0);
      
      // Try to get starting code from detailed JSON
      let startCode = '';
      if (projectsData.length > 0 && selectedTask) {
        const detailedProject = projectsData.find(p => p.project_id === projectId);
        if (detailedProject) {
          const detailedTask = detailedProject.tasks.find(t => t.task_id === selectedTask.task_id);
          if (detailedTask) {
            const detailedStep = detailedTask.steps.find(s => s.step_id === step.step_id);
            if (detailedStep && detailedStep.starting_code) {
              startCode = detailedStep.starting_code;
              setCode(startCode);
              setOriginalCode(startCode);
              return;
            }
          }
        }
      }
      // Fallback to the code from ProjectsData
      startCode = step.starterCode || '';
      setCode(startCode);
      setOriginalCode(startCode);
    } else {
      // Find the previous step that needs to be completed
      const previousStep = selectedTask.steps.find(s => 
        s.order === step.order - 1 || 
        (step.dependencies && step.dependencies.includes(s.step_id))
      );
      
      showNotification(
        previousStep 
          ? `You need to complete "${previousStep.step_name}" first` 
          : "This step is currently locked",
        'warning'
      );
    }
  };

  // Helper function to mark a step as complete
  const markStepComplete = (projectId, taskId, stepId) => {
    // Find the project
    const projectIndex = pythonProjects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return false;
    
    // Find the task
    const taskIndex = pythonProjects[projectIndex].tasks.findIndex(t => t.task_id === taskId);
    if (taskIndex === -1) return false;
    
    // Find the step
    const stepIndex = pythonProjects[projectIndex].tasks[taskIndex].steps.findIndex(s => s.step_id === stepId);
    if (stepIndex === -1) return false;
    
    // Mark the step as completed
    pythonProjects[projectIndex].tasks[taskIndex].steps[stepIndex].isCompleted = true;
    
    // Update project XP
    const stepXP = pythonProjects[projectIndex].tasks[taskIndex].steps[stepIndex].xpValue || 10;
    pythonProjects[projectIndex].xpGained += stepXP;
    
    // Calculate progress percentage
    const totalSteps = pythonProjects[projectIndex].tasks.reduce((acc, task) => acc + task.steps.length, 0);
    const completedSteps = pythonProjects[projectIndex].tasks.reduce((acc, task) => 
      acc + task.steps.filter(step => step.isCompleted).length, 0);
    
    pythonProjects[projectIndex].questProgress = Math.round((completedSteps / totalSteps) * 100);
    
    return true;
  };

  // Helper function to unlock the next step
  const unlockNextStep = (projectId, taskId, stepId) => {
    // Find the project
    const projectIndex = pythonProjects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return false;
    
    // Find the task
    const taskIndex = pythonProjects[projectIndex].tasks.findIndex(t => t.task_id === taskId);
    if (taskIndex === -1) return false;
    
    // Find the step
    const stepIndex = pythonProjects[projectIndex].tasks[taskIndex].steps.findIndex(s => s.step_id === stepId);
    if (stepIndex === -1) return false;
    
    // Check if there's a next step in the same task
    if (stepIndex < pythonProjects[projectIndex].tasks[taskIndex].steps.length - 1) {
      // Unlock the next step in the same task
      pythonProjects[projectIndex].tasks[taskIndex].steps[stepIndex + 1].isUnlocked = true;
    } else {
      // This was the last step in the task, mark the task as completed
      pythonProjects[projectIndex].tasks[taskIndex].isCompleted = true;
      
      // Check if there's a next task to unlock
      if (taskIndex < pythonProjects[projectIndex].tasks.length - 1) {
        // Unlock the next task
        pythonProjects[projectIndex].tasks[taskIndex + 1].isUnlocked = true;
        
        // Unlock the first step of the next task
        if (pythonProjects[projectIndex].tasks[taskIndex + 1].steps.length > 0) {
          pythonProjects[projectIndex].tasks[taskIndex + 1].steps[0].isUnlocked = true;
        }
      }
    }
    
    return true;
  };

  // Handle step completion
  const handleStepComplete = () => {
    if (selectedTask && selectedStep) {
      // Set processing state
      setStepStatus('processing');
      
      // Simulate processing delay
      setTimeout(() => {
        // Simulate success/failure based on some condition (e.g., code changes)
        const isSuccessful = codeChanged && Math.random() > 0.2; // 80% success rate if code was changed
        
        if (isSuccessful) {
          const success = markStepComplete(projectId, selectedTask.task_id, selectedStep.step_id);
          if (success) {
            // Set completed state
            setStepStatus('completed');
            
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
            
            // Refresh project data
            const updatedProject = pythonProjects.find(p => p.id === projectId);
            setProject(updatedProject);
            
            // Update selected task and step with the latest data
            const updatedTask = updatedProject.tasks.find(t => t.task_id === selectedTask.task_id);
            
            // Get enhanced task data
            let enhancedTask = {...updatedTask};
            if (projectsData.length > 0) {
              const detailedProject = projectsData.find(p => p.project_id === projectId);
              if (detailedProject) {
                const detailedTask = detailedProject.tasks.find(t => t.task_id === updatedTask.task_id);
                if (detailedTask) {
                  enhancedTask = {...enhancedTask, ...detailedTask};
                }
              }
            }
            setSelectedTask(enhancedTask);
            
            const updatedStep = updatedTask.steps.find(s => s.step_id === selectedStep.step_id);
            
            // Get enhanced step data
            let enhancedStep = {...updatedStep};
            if (projectsData.length > 0) {
              const detailedProject = projectsData.find(p => p.project_id === projectId);
              if (detailedProject) {
                const detailedTask = detailedProject.tasks.find(t => t.task_id === updatedTask.task_id);
                if (detailedTask) {
                  const detailedStep = detailedTask.steps.find(s => s.step_id === updatedStep.step_id);
                  if (detailedStep) {
                    enhancedStep = {...enhancedStep, ...detailedStep};
                  }
                }
              }
            }
            setSelectedStep(enhancedStep);
            
            // Show success notification
            showNotification('Mission accomplished! Next step unlocked.', 'success');
          }
        } else {
          // Set failed state
          setStepStatus('failed');
          
          // Play error sound
          if (audioRef.current && audioRef.current.error) {
            audioRef.current.error.play().catch(e => console.log('Audio play error:', e));
          }
          
          // Decrease streak
          decreaseStreak();
          
          // Increase hints level to show more hints
          setHintsLevel(prev => Math.min(prev + 1, 3));
          setShowHints(true);
          
          // Show failure notification
          showNotification(
            codeChanged 
              ? 'Mission failed. Try again with the provided hints.' 
              : 'You need to modify the code before completing the mission.',
            'error'
          );
        }
      }, 1500);
    }
  };

  // Handle retry after failure
  // eslint-disable-next-line no-unused-vars
  const handleRetryStep = () => {
    setStepStatus('idle');
  };

  // Handle code changes in the editor
  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  // Navigate back to project suggestions
  const handleBackClick = () => {
    navigate('/project-suggestions');
  };

  // Simulate code execution
  const simulateCodeExecution = () => {
    if (!codeChanged) {
      showNotification('Make changes to the code before running', 'warning');
      return;
    }
    
    setShowTerminal(true);
    setCodeExecutionOutput("Running code...");
    
    // Simulate code execution with a delay
    setTimeout(() => {
      // This is a simulation - in a real app, you'd actually run the code
      if (selectedStep && selectedStep.expectedOutput) {
        setCodeExecutionOutput(selectedStep.expectedOutput);
      } else {
        setCodeExecutionOutput("Code executed successfully!\n> Hello, world!\n> Program completed with exit code 0");
      }
    }, 1500);
  };

  const toggleHints = () => {
    setShowHints(!showHints);
  };

  const scrollToCodeEditor = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="loading-screen fullscreen-game">
        <div className="loading-spinner"></div>
        <h2>Loading your coding adventure...</h2>
        <p>Preparing your quest, please wait...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="error-screen fullscreen-game">
        <h2>Quest not found!</h2>
        <p>The coding adventure you're looking for seems to be missing.</p>
        <button className="futuristic-button" onClick={handleBackClick}>Return to Quests</button>
      </div>
    );
  }

  return (
    <div className="steps-container futuristic-theme fullscreen-game">
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
      
      <div className="project-header game-header">
        <button className="back-button neon-button" onClick={handleBackClick}>← Return to Quest Hub</button>
        <h1 className="project-title game-title">{project.name}</h1>
        <div className="project-progress game-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${project.questProgress}%` }}
            ></div>
          </div>
          <span className="progress-text">{project.questProgress}% Quest Completion</span>
          <div className="xp-badge game-badge">
            <span className="xp-icon">⭐</span>
            <span>XP: {project.xpGained}</span>
          </div>
          <div className="streak-counter game-counter">
            <span className="streak-icon">🔥</span>
            <span>Streak: {streakCount}</span>
          </div>
        </div>
        <button className="scroll-to-editor-button neon-button" onClick={scrollToCodeEditor}>
          Jump to Code Editor ↓
        </button>
      </div>

      <div className="content-area game-content" style={{ maxHeight: "60vh", overflowY: "auto" }}>
        <div className="tasks-sidebar game-sidebar">
          <h2 className="sidebar-title">Quest Tasks</h2>
          <ul className="tasks-list">
            {project.tasks.map((task) => (
              <li 
                key={task.task_id}
                className={`task-item game-task ${task.isUnlocked ? 'unlocked' : 'locked'} ${selectedTask && task.task_id === selectedTask.task_id ? 'selected' : ''} ${task.isCompleted ? 'completed' : ''}`}
                onClick={() => handleTaskSelect(task)}
              >
                <div className="task-title">
                  {task.isCompleted ? '✓ ' : task.isUnlocked ? '⚔️ ' : '🔒 '}{task.task_name}
                </div>
                {task.isCompleted && <span className="task-badge game-badge">Completed</span>}
                {!task.isUnlocked && <span className="locked-icon">🔒</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="steps-content game-main-content">
          {selectedTask && (
            <>
              <div className="task-details game-details">
                <h2 className="task-title game-subtitle">{selectedTask.task_name}</h2>
                <p className="quest-description futuristic-description">{selectedTask.description}</p>
                {selectedTask.objectives && (
                  <div className="task-objectives game-objectives">
                    <h4 className="objectives-title">Mission Objectives:</h4>
                    <ul className="objectives-list">
                      {selectedTask.objectives.map((objective, index) => (
                        <li key={index} className="objective-item game-objective">
                          <span className="objective-icon">🎯</span> {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="steps-list game-steps">
                <h3 className="steps-title">Mission Steps</h3>
                <ul className="step-cards">
                  {selectedTask.steps.map((step) => (
                    <li 
                      key={step.step_id}
                      className={`step-card game-step-card ${step.isUnlocked ? 'unlocked' : 'locked'} ${selectedStep && step.step_id === selectedStep.step_id ? 'selected' : ''} ${step.isCompleted ? 'completed' : ''} ${!step.isCompleted && step.isUnlocked && !selectedStep?.isCompleted ? 'unlocking' : ''}`}
                      onClick={() => handleStepSelect(step)}
                    >
                      <div className="step-header">
                        <div className="step-title">
                          {step.isCompleted ? '✓ ' : step.isUnlocked ? '⚡ ' : '🔒 '}{step.step_name}
                        </div>
                        {step.isCompleted && <span className="step-xp">+{step.xpValue || 10} XP</span>}
                      </div>
                      
                      {/* Show step details inside the card when selected */}
                      {selectedStep && step.step_id === selectedStep.step_id && (
                        <div className="step-card-details">
                          <div className="step-description futuristic-description">{step.description}</div>
                          
                          {step.guidelines && (
                            <div className="step-instructions game-instructions">
                              <h4 className="instructions-title">Mission Briefing:</h4>
                              <ul className="guidelines-list">
                                {Array.isArray(step.guidelines) ? 
                                  step.guidelines.map((guideline, index) => (
                                    <li key={index} className="guideline-item">
                                      <span className="guideline-bullet">•</span> {guideline}
                                    </li>
                                  )) : 
                                  <div className="instruction-content futuristic-description">{step.guidelines}</div>
                                }
                              </ul>
                            </div>
                          )}
                          
                          {step.expectedOutput && (
                            <div className="expected-output game-expected-output">
                              <h4 className="output-title">Expected Mission Outcome:</h4>
                              <pre className="output-content">{step.expectedOutput}</pre>
                            </div>
                          )}
                          
                          <div className="step-actions game-actions">
                            {step.hints && step.hints.length > 0 && (
                              <button className="hint-toggle neon-button game-button" onClick={toggleHints}>
                                {showHints ? 'Hide Hints' : 'Show Hints'}
                              </button>
                            )}
                            
                            <button 
                              className={`complete-button neon-button game-button ${step.isCompleted ? 'completed' : ''}`}
                              onClick={handleStepComplete}
                              disabled={step.isCompleted}
                            >
                              {step.isCompleted ? '✓ Mission Accomplished' : `Complete Mission (+${step.xpValue || 10} XP)`}
                            </button>
                          </div>
                          
                          {showHints && step.hints && step.hints.length > 0 && (
                            <div className="hints-panel game-hints">
                              <h4 className="hints-title">Mission Assistance:</h4>
                              <ul className="hints-list">
                                {step.hints.map((hint, index) => (
                                  <li key={index} className="hint-item game-hint">
                                    <span className="hint-icon">💡</span> {hint}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="code-editor-section game-editor" ref={bottomRef}>
        <div className="editor-header game-editor-header">
          <h3 className="editor-title">Code Terminal</h3>
          <div className="editor-actions">
            <button className="run-code-button neon-button game-run-button" onClick={simulateCodeExecution}>
              ▶ Run Code
            </button>
          </div>
        </div>
        
        <CodeEditor 
          code={code} 
          onChange={handleCodeChange} 
          language="python"
          className="game-code-editor"
        />
        
        {showTerminal && (
          <div className="terminal-output game-terminal">
            <div className="terminal-header">
              <span>Output Terminal</span>
              <button className="close-terminal" onClick={() => setShowTerminal(false)}>×</button>
            </div>
            <pre className="terminal-content">{codeExecutionOutput}</pre>
          </div>
        )}
        
        {selectedStep && selectedStep.codeHints && (
          <div className="code-hints game-code-hints">
            <h4 className="hints-title">Code Assistance:</h4>
            <ul className="code-hints-list">
              {selectedStep.codeHints.map((hint, index) => (
                <li key={index} className="code-hint-item game-code-hint">
                  <span className="hint-icon">⌨️</span> {hint}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <button 
        className="back-to-top-button neon-button" 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}
      >
        ↑ Back to Top
      </button>
    </div>
  );
};

export default Steps;
