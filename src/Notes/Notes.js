import React, { useState, useEffect } from 'react';
import './Notes.css';

const Notes = () => {
  const [goals, setGoals] = useState([
    { id: 1, name: 'Complete React Course', progress: 70 },
    { id: 2, name: 'Build a Portfolio Website', progress: 50 },
    { id: 3, name: 'Start AI Project', progress: 30 },
  ]);

  const [suggestions, setSuggestions] = useState([]);

  // Fetch suggestions based on progress
  useEffect(() => {
    // Simulate API call to get suggestions
    const newSuggestions = [
      'Explore advanced React libraries',
      'Consider learning GraphQL',
      'Practice design patterns for AI projects',
    ];
    setSuggestions(newSuggestions);
  }, []);

  return (
    <div className="notes-container">
      <h1>Your Goals & Progress</h1>

      <div className="goals-list">
        {goals.map((goal) => (
          <div key={goal.id} className="goal-item">
            <h3>{goal.name}</h3>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${goal.progress}%` }}></div>
              <span className="progress-percent">{goal.progress}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="suggestions-section">
        <h2>Suggestions for You</h2>
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Notes;
