import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Tooltip from './Tooltip';
import Highlighter from './Highlighter';
import RestartTourButton from './RestartTourButton';

const tourSteps = {
  home: [
    {
      selector: '.logo-container-nav',
      message: '🏠 Welcome to EduVerse! Click the logo anytime to return home.'
    },
    {
      selector: '.nav-item-container .nav-item:nth-child(2)',
      message: '🔍 Use Search to find projects, jobs, and community members.'
    },
    {
      selector: '.nav-item-container .nav-item:nth-child(3)',
      message: '🧠 This is Edura — your personal AI guide for learning and career growth.'
    },
    {
      selector: '.nav-item-container .nav-item:nth-child(4)',
      message: '🛠️ Welcome to BuildZone — explore and create community projects.'
    },
    {
      selector: '.nav-item-container .nav-item:nth-child(5)',
      message: '👤 Your profile — showcase your skills and achievements.'
    },
    {
      selector: 'nav.navbar',
      message: '🧭 This is your navigation bar — use it to move between sections.'
    }
  ],
  edura: [
    {
      selector: '.edura-chat',
      message: '💬 Chat with Edura - your AI mentor for personalized guidance.'
    },
    {
      selector: '.edura-suggestions',
      message: '💡 Get AI-powered suggestions for your learning journey.'
    },
    {
      selector: '.edura-history',
      message: '📚 Review your past conversations and track your progress.'
    }
  ],
  messages: [
    {
      selector: '.message-inbox',
      message: '📥 Your message inbox - stay connected with the community.'
    },
    {
      selector: '.message-compose',
      message: '✍️ Start a new conversation with other members.'
    }
  ],
  profile: [
    {
      selector: '.profile-header',
      message: '👤 Your profile - showcase your skills and achievements.'
    },
    {
      selector: '.profile-edit',
      message: '✏️ Customize your profile to stand out.'
    },
    {
      selector: '.profile-activity',
      message: '📊 Track your activity and contributions.'
    }
  ]
};

// Pure functions moved outside component
const getCurrentPage = (pathname) => pathname.split('/')[1] || 'home';

const getCurrentSteps = (pathname) => {
  const page = getCurrentPage(pathname);
  return tourSteps[page] || [];
};

const TourManager = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  const [isTourActive, setIsTourActive] = useState(false);
  const [error, setError] = useState(null);
  const [isMissing, setIsMissing] = useState(false);
  const location = useLocation();

  // Get current steps using the pure function
  const steps = getCurrentSteps(location.pathname);
  const isHomePage = location.pathname === '/';

  // Reset tour when pathname changes
  useEffect(() => {
    setStepIndex(0);
    setTargetRect(null);
    setTooltipPos(null);
    setError(null);
    setIsMissing(false);
  }, [location.pathname]);

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setIsTourActive(true);
    }
  }, []);

  // Function to find element with retry
  const findElement = (selector, retries = 3, delay = 100) => {
    return new Promise((resolve) => {
      let attempts = 0;
      
      const tryFind = () => {
        const el = document.querySelector(selector);
        console.log(`Attempt ${attempts + 1}: Looking for ${selector}`, el);
        
        if (el) {
          resolve(el);
        } else if (attempts < retries) {
          attempts++;
          setTimeout(tryFind, delay);
        } else {
          console.warn(`Element not found after ${retries} attempts: ${selector}`);
          resolve(null);
        }
      };
      
      tryFind();
    });
  };

  const nextStep = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // Tour completed for current page
      setTargetRect(null);
      setIsTourActive(false);
      localStorage.setItem('hasSeenTour', 'true');
    }
  }, [stepIndex, steps.length]);

  const skipTour = useCallback(() => {
    setTargetRect(null);
    setIsTourActive(false);
    localStorage.setItem('hasSeenTour', 'true');
  }, []);

  const restartTour = useCallback(() => {
    setStepIndex(0);
    setIsTourActive(true);
    setError(null);
    localStorage.removeItem('hasSeenTour');
  }, []);

  useEffect(() => {
    if (!isTourActive) return;
    if (steps.length === 0) return;

    const step = steps[stepIndex];
    console.log('Current step:', step);

    // Try to find the element with retries
    findElement(step.selector).then(el => {
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        setError(null);
        setIsMissing(false);
        
        // Calculate tooltip position
        const tooltipPosition = {
          top: rect.bottom + 12 + window.scrollY,
          left: rect.left + window.scrollX,
        };
        
        // Adjust position if tooltip would go off screen
        const tooltipWidth = 300; // Approximate tooltip width
        if (tooltipPosition.left + tooltipWidth > window.innerWidth) {
          tooltipPosition.left = window.innerWidth - tooltipWidth - 20;
        }
        
        setTooltipPos(tooltipPosition);
      } else {
        // Element not found, show error and auto-advance
        setError(`Could not find element: ${step.selector}`);
        console.warn(`Tour step skipped: ${step.selector} not found`);
        setIsMissing(true);
        setTimeout(nextStep, 2000); // Give user time to see the warning
      }
    });
  }, [stepIndex, isTourActive, location.pathname, steps, nextStep]);

  // Debug information
  useEffect(() => {
    if (error) {
      console.warn('Tour Error:', error);
    }
  }, [error]);

  return (
    <>
      {isTourActive && targetRect && (
        <>
          <Highlighter 
            targetRect={targetRect} 
            currentStep={steps[stepIndex]}
          />
          <Tooltip 
            key={stepIndex}
            message={steps[stepIndex].message}
            position={tooltipPos}
            onNext={nextStep}
            onSkip={skipTour}
            isMissing={isMissing}
            stepIndex={stepIndex}
          />
        </>
      )}
      {isHomePage && <RestartTourButton onRestart={restartTour} />}
    </>
  );
};

export default TourManager; 