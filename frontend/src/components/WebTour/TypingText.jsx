import React, { useState, useEffect } from 'react';
import './TypingText.css';

const TypingText = ({ text, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30); // Adjust typing speed here

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return (
    <div className="typing-text">
      {displayText}
      {currentIndex < text.length && <span className="typing-cursor">|</span>}
    </div>
  );
};

export default TypingText; 