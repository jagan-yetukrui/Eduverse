import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectSuggestions.css';

const ProjectSuggestions = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: 'Python',
      image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      projectsCount: '10',
      level: 'All Levels'
    },
    {
      name: 'Java',
      image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
      projectsCount: '8',
      level: 'All Levels'
    },
    {
      name: 'React',
      image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      projectsCount: '12',
      level: 'All Levels'
    },
    {
      name: 'Node.js',
      image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
      projectsCount: '9',
      level: 'All Levels'
    },
    {
      name: 'SQL',
      image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
      projectsCount: '7',
      level: 'All Levels'
    },
    {
      name: 'AWS',
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImF3c0dyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRjk5MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGRkM3MDAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBmaWxsPSJ1cmwoI2F3c0dyYWQpIiBkPSJNMjUgMzBMNTAgMTVMNzUgMzBMNzUgNzBMNTAgODVMMjUgNzBMMjUgMzBaIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTM1IDQwTDUwIDMwTDY1IDQwTDY1IDYwTDUwIDcwTDM1IDYwTDM1IDQwWiIvPjxwYXRoIGZpbGw9InVybCgjYXdzR3JhZCkiIGQ9Ik00MCA0NUw1MCA0MEw2MCA0NUw2MCA1NUw1MCA2MEw0MCA1NUw0MCA0NVoiLz48cGF0aCBmaWxsPSIjMjMyRjNFIiBkPSJNMTUgNTBMMjUgNDVMMjUgNTVMMTUgNTBNODUgNTBMNzUgNDVMNzUgNTVMODUgNTBNNTAgMTBMNDAgMTVMNjAgMTVMNTAgMTBNNTAgOTBMNDAgODVMNjAgODVMNTAgOTAiLz48L3N2Zz4=',
      projectsCount: '6',
      level: 'All Levels'
    }
  ];

  const handleProjectSelect = (category) => {
    navigate(`/projects/${category.name.toLowerCase()}`);
  };

  return (
    <div className="projects-page">
      <button 
        className="back-button"
        onClick={() => navigate('/notes')}
      >
        ← Back to Edura
      </button>
      
      <div className="header-section">
        <h1 className="page-heading">🚀 Pick Your Coding Realm</h1>
        <p className="page-subheading">
          Let Edura guide you through magical, real-world projects tailored to your journey.
        </p>
      </div>
      
      <div className="category-section">
        <h2 className="section-heading">💬 Choose Your Domain</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <div 
              key={category.name}
              className="category-card"
              onClick={() => handleProjectSelect(category)}
            >
              <img src={category.image} alt={category.name} />
              <h3>{category.name}</h3>
              <p>{category.projectsCount} Projects · {category.level}</p>
              <button>
                ✨ Explore
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectSuggestions;
