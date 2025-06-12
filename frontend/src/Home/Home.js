import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import ProfileCardHome from "./ProfileCardHome";

import mockTrendingProjects from "../mockdata/trending_projects.json";
import mockUpcomingEvents from "../mockdata/upcoming_events.json";

const Home = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileSuggestions, setProfileSuggestions] = useState([]);
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('activeSection') || 'home';
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(Boolean(token));
  }, []);

  useEffect(() => {
    fetchProfileSuggestions();
  }, []);

  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
  }, [activeSection]);

  const fetchProfileSuggestions = async () => {
    try {
      const response = await fetch("https://edu-verse.in/api/profiles/");
      const data = await response.json();
      setProfileSuggestions(data);
    } catch (error) {
      console.error("Error fetching profile suggestions:", error);
    }
  };

  const handleFollow = (userId) => {
    console.log(`Follow user with ID: ${userId}`);
  };

  const handleExploreProjects = () => {
    navigate('/project-suggestions');
  };

  const renderContent = () => {
    if (activeSection === 'home') {
      return (
        <div className={isAuthenticated ? "content-section" : "full-screen-landing"}>
          {!isAuthenticated ? (
            <div className="landing-page">
              <section className="hero-section">
                <h1>Welcome to <span>EduVerse</span></h1>
                <p>Your AI-powered space to learn, connect, and build your future.</p>
                <div className="hero-buttons">
                  <button onClick={handleExploreProjects}>Explore Projects</button>
                  <button onClick={() => navigate('/newpost')}>Create Something</button>
                </div>
              </section>

              <section className="ai-status-section">
                <div className="edura-avatar">
                  <div className="avatar-wave"></div>
                </div>
                <p>Edura is ready to help you today.</p>
              </section>
            </div>
          ) : (
            <div className="feed-teaser-section">
              <h1 className="glow-title">Your Feed is Almost Here</h1>
              <p className="teaser-subtext">
                Get ready for a personalized learning experience curated by <strong>Edura</strong>.  
                Projects, opportunities, and mentors — all in one dynamic space.
              </p>
              <div className="launch-info">
                <span>🔄 Launching Soon...</span>
                <span className="countdown">Q3 2025</span>
              </div>
              <button className="notify-btn">Notify Me</button>
            </div>
          )}
        </div>
      );
    }

    switch(activeSection) {
      case 'trending':
        return (
          <div className="content-section trending-projects animate-slide">
            <h2>Trending Projects</h2>
            <div className="projects-grid">
              {mockTrendingProjects.map((project) => (
                <div key={project.id} className="project-card hover-effect">
                  <h3>{project.name}</h3>
                  <p className="project-description">{project.description.substring(0, 100)}...</p>
                  <div className="project-meta">
                    <span className="project-category">{project.category}</span>
                    <span className="project-stats">
                      {project.popularity} • {project.teamSize}
                    </span>
                  </div>
                  <button className="more-info-btn">More Info</button>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'connections':
        return (
          <div className="content-section connections animate-slide">
            <h2>Connections</h2>
            <input 
              type="search"
              placeholder="Search connections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="connection-search"
            />
            <div className="connections-grid">
              {profileSuggestions.map((profile) => (
                <ProfileCardHome
                  key={profile.id}
                  profile={profile}
                  onFollow={handleFollow}
                  className="profile-card hover-effect"
                />
              ))}
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="content-section events animate-slide">
            <h2>Upcoming Events</h2>
            <div className="events-list">
              {mockUpcomingEvents.map((event) => (
                <div key={event.id} className="event-item hover-effect">
                  <h3 className="event-name">{event.eventName}</h3>
                  <div className="event-datetime">
                    <span>{event.date}</span>
                    <span>{event.time}</span>
                  </div>
                  <div className="event-location">{event.location}</div>
                  <p className="event-description">{event.description}</p>
                  <div className="event-tags">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="event-tag">{tag}</span>
                    ))}
                  </div>
                  <a href={event.registrationLink} className="event-registration" target="_blank" rel="noopener noreferrer">
                    Register Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="home-container">
      {isAuthenticated && (
        <div className="main-content">
          <nav className="side-nav" style={{right: 0, width: '200px', borderRadius: '12px', margin: '1rem', height: 'auto'}}>
            <button 
              className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
              onClick={() => setActiveSection('home')}
            >
              Home
            </button>
            <button 
              className={`nav-link ${activeSection === 'trending' ? 'active' : ''}`}
              onClick={() => setActiveSection('trending')}
            >
              Trending Projects
            </button>
            <button 
              className={`nav-link ${activeSection === 'connections' ? 'active' : ''}`}
              onClick={() => setActiveSection('connections')}
            >
              Connections
            </button>
            <button 
              className={`nav-link ${activeSection === 'events' ? 'active' : ''}`}
              onClick={() => setActiveSection('events')}
            >
              Upcoming Events
            </button>
          </nav>
          
          <div className="content-container">
            {renderContent()}
          </div>
        </div>
      )}

      {!isAuthenticated && renderContent()}

      <footer className="footer-container">
        <div className="footer-links">
          <Link to="/about">About</Link>
          <div className="divider-vertical"></div>
          <Link to="/privacy">Privacy</Link>
          <div className="divider-vertical"></div>
          <Link to="/terms">Terms</Link>
          <div className="divider-vertical"></div>
          <Link to="/contact">Contact</Link>
        </div>
        <p className="copyright">© 2024 EduVerse. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;