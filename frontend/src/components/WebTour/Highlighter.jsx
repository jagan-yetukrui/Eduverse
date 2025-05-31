import React, { useEffect } from 'react';
import './Highlighter.css';

const Highlighter = ({ targetRect, currentStep }) => {
  useEffect(() => {
    // Always highlight the navbar
    const navbar = document.querySelector('nav.navbar');
    if (navbar) {
      navbar.classList.add('tour-tab-highlight');
    }

    // For non-navbar steps, add the floating highlight
    if (currentStep && currentStep.selector !== 'nav.navbar') {
      const el = document.querySelector(currentStep.selector);
      if (el) {
        el.classList.add('tour-active-highlight');
      }
    }

    return () => {
      // Cleanup navbar highlight
      if (navbar) {
        navbar.classList.remove('tour-tab-highlight');
      }

      // Cleanup element highlight
      if (currentStep && currentStep.selector !== 'nav.navbar') {
        const el = document.querySelector(currentStep.selector);
        if (el) {
          el.classList.remove('tour-active-highlight');
        }
      }
    };
  }, [currentStep]);

  if (!targetRect) return null;

  const padding = 12;
  const top = targetRect.top + window.scrollY - padding;
  const left = targetRect.left + window.scrollX - padding;
  const width = targetRect.width + padding * 2;
  const height = targetRect.height + padding * 2;

  return (
    <>
      {/* Dark overlay for the entire screen */}
      <div className="tour-overlay" />
      
      {/* Floating highlight box */}
      <div
        className="floating-highlight-box"
        style={{
          top,
          left,
          width,
          height,
        }}
      />
    </>
  );
};

export default Highlighter; 