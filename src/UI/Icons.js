// src/components/UI/Icon.js

import React from 'react';
import FirstLogo from '../First_logo.png'; // Adjust the path based on your structure

// Create a general Icon component to handle SVG rendering and images
const Icon = ({ name, ...props }) => {
  const icons = {
    logo: <img src={FirstLogo} alt="EduVerse Logo" {...props} />,
    home: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M12 3L2 9v11h8V12h4v8h8V9l-10-6z" />
      </svg>
    ),
    search: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M10 18c4.418 0 8-3.582 8-8s-3.582-8-8-8S2 5.582 2 10s3.582 8 8 8zm0-2c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6zM21.71 20.29l-5.4-5.39A7.92 7.92 0 0018 9a8 8 0 10-8 8 7.92 7.92 0 005.9-2.69l5.4 5.4a1 1 0 001.42-1.42zM4 9a5 5 0 115 5 5 5 0 01-5-5z" />
      </svg>
    ),
    message: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M20 2H4a2 2 0 00-2 2v20l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zm0 14H6.83L4 18.83V4h16z" />
      </svg>
    ),
    notes: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" />
      </svg>
    ),
    newpost: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M12 2v8H4v2h8v8h2v-8h8v-2h-8V2h-2z" />
      </svg>
    ),
    // Add more icons as needed...
  };

  return icons[name] || null;
};

export default Icon;
