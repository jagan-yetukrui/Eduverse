import React, { useEffect, useState } from 'react';
import { Steps } from 'intro.js-react';
import 'intro.js/minified/introjs.min.css';
import './TourProvider.css';

const TourProvider = ({ children }) => {
  const [stepsEnabled, setStepsEnabled] = useState(false);
  const [initialStep, setInitialStep] = useState(0);

  const steps = [
    {
      element: '#eduverse-logo',
      intro: "✨ Welcome to EduVerse! This is your command center for navigating through the platform.",
      position: 'bottom'
    },
    {
      element: '#edura-nav',
      intro: "🤖 Meet Edura, your AI mentor! Get personalized guidance and support for your learning journey.",
      position: 'left'
    },
    {
      element: '#buildzone-nav',
      intro: "🚀 BuildZone is where the magic happens! Explore and build amazing projects in our collaborative workspace.",
      position: 'right'
    },
    {
      element: '.projects-grid',
      intro: "💡 Discover trending projects and join the community of builders and learners.",
      position: 'top'
    },
    {
      element: '.profile-section',
      intro: "👤 Manage your profile, showcase your skills, and track your achievements here.",
      position: 'left'
    },
    {
      element: '.notifications',
      intro: "🔔 Stay updated with your notifications and messages to never miss important updates.",
      position: 'bottom'
    },
    {
      intro: "🎉 You're all set! Explore, learn, and grow with EduVerse. Remember, you can replay this tour anytime using the button in the bottom right."
    }
  ];

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('eduverseFirstVisit');
    if (!hasSeenIntro) {
      setStepsEnabled(true);
    }
  }, []);

  const onExit = () => {
    setStepsEnabled(false);
    localStorage.setItem('eduverseFirstVisit', 'true');
  };

  const startTour = () => {
    setInitialStep(0);
    setStepsEnabled(true);
  };

  return (
    <div className="tour-provider">
      {children}
      <Steps
        enabled={stepsEnabled}
        steps={steps}
        initialStep={initialStep}
        onExit={onExit}
        options={{
          showProgress: true,
          showBullets: true,
          exitOnOverlayClick: false,
          disableInteraction: false,
          tooltipClass: 'custom-tooltip',
          highlightClass: 'custom-highlight',
          scrollToElement: true,
          scrollPadding: 0,
          overlayOpacity: 0.7,
          backdropFilter: 'blur(3px)',
          showStepNumbers: false,
          keyboardNavigation: true,
          disableInteraction: false,
          hideNext: false,
          hidePrev: false,
          nextLabel: 'Next →',
          prevLabel: '← Previous',
          skipLabel: 'Skip Tour',
          doneLabel: 'Got it!'
        }}
      />
      <button 
        className="replay-tour-button"
        onClick={startTour}
      >
        Replay Tour
      </button>
    </div>
  );
};

export default TourProvider; 