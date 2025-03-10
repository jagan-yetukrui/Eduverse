import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import ProfileCardHome from "./ProfileCardHome";

import mockTrendingProjects from "../mockdata/trending_projects.json";
import mockUpcomingEvents from "../mockdata/upcoming_events.json";

const Home = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileSuggestions, setProfileSuggestions] = useState([]);
  const [trendingProjects, setTrendingProjects] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('activeSection') || 'home';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [hasConnections, setHasConnections] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(Boolean(token));
  }, []);

  useEffect(() => {
    fetchProfileSuggestions();
    fetchTrendingProjects();
    fetchUpcomingEvents();
  }, []);

  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
  }, [activeSection]);

  const fetchProfileSuggestions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/profiles/");
      const data = await response.json();
      setProfileSuggestions(data);
      setHasConnections(data.length > 0);
    } catch (error) {
      console.error("Error fetching profile suggestions:", error);
    }
  };

  const fetchTrendingProjects = async () => {
    try {
      const response = await fetch("/api/projects/trending");
      const data = await response.json();
      setTrendingProjects(data);
    } catch (error) {
      console.error("Error fetching trending projects:", error);
      setTrendingProjects(mockTrendingProjects);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch("/api/events/upcoming");
      const data = await response.json();
      setUpcomingEvents(data);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      setUpcomingEvents(mockUpcomingEvents);
    }
  };

  const handleFollow = (userId) => {
    console.log(`Follow user with ID: ${userId}`);
  };

  const renderContent = () => {
    if (activeSection === 'home') {
      return (
        <div className="content-section welcome-message animate-slide">
          <h2>Welcome to EduVerse!</h2>
          <p>Your gateway to collaborative learning and professional development.</p>
          <p>Connect with experts, join exciting projects, and grow your skills in a vibrant community.</p>
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
      {!isAuthenticated ? (
        <div className="welcome-section">
          <div className="welcome-title">
            <h3>Welcome to</h3>
            <h1>EduVerse</h1>
          </div>
          <p className="welcome-subtitle">
            Your premium platform for collaborative learning and professional growth
          </p>
        </div>
      ) : (
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

      <footer className="footer-container">
        <div className="footer-links">
          <a href="/about">About</a>
          <div className="divider-vertical"></div>
          <a href="/privacy">Privacy</a>
          <div className="divider-vertical"></div>
          <a href="/terms">Terms</a>
          <div className="divider-vertical"></div>
          <a href="/contact">Contact</a>
        </div>
        <p className="copyright">© 2024 EduVerse. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;