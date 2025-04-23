import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CareerGuidance.css';

const CareerGuidance = () => {
  const navigate = useNavigate();

  return (
    <div className="career-guidance">
      <button 
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="coming-soon-container">
        <h2>Career Compass</h2>
        <div className="coming-soon-content">
          <h3>Coming Soon!</h3>
          <p>We're working on an exciting career guidance tool to help you navigate your tech journey.</p>
          <p>This feature will help you:</p>
          <ul>
            <li>Discover career paths that match your skills and interests</li>
            <li>Analyze your progress toward your dream job</li>
            <li>Get personalized recommendations for next steps</li>
            <li>Identify essential skills to develop</li>
          </ul>
          <p>Check back soon for this powerful career planning tool!</p>
        </div>
      </div>
    </div>
  );
};

export default CareerGuidance;
