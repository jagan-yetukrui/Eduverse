import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css';
import ProfileCardHome from './ProfileCardHome';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileSuggestions, setProfileSuggestions] = useState([]);
  const [trendingProjects, setTrendingProjects] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    fetchProfileSuggestions();
    fetchTrendingProjects();
    fetchUpcomingEvents();
  }, []);

  const fetchProfileSuggestions = async () => {
    try {
      const response = await fetch('/api/profiles/suggestions');
      const data = await response.json();
      setProfileSuggestions(data);
    } catch (error) {
      console.error('Error fetching profile suggestions:', error);
    }
  };

  const fetchTrendingProjects = async () => {
    try {
      const response = await fetch('/api/projects/trending');
      const data = await response.json();
      setTrendingProjects(data);
    } catch (error) {
      console.error('Error fetching trending projects:', error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch('/api/events/upcoming');
      const data = await response.json();
      setUpcomingEvents(data);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    }
  };

  const handleFollow = (userId) => {
    console.log(`Follow user with ID: ${userId}`);
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="premium-header">
        <div className="logo-container" style={{ marginLeft: '70px' }}>
          <h1 className="app-name">EduVerse</h1>
        </div>
      </header>

      <div className="main-layout">
        {/* Main Content */}
        <main className="main-content">
          {!isAuthenticated ? (
            <div className="welcome-section">
              <h1 className="welcome-title">Welcome to EduVerse</h1>
              <p className="welcome-subtitle">Your premium platform for collaborative learning and professional growth</p>
              <div className="auth-buttons">
                <button onClick={() => navigate('/login')} className="premium-button login">Login</button>
                <button onClick={() => navigate('/register')} className="premium-button register">Register</button>
              </div>
            </div>
          ) : (
            <div className="feed-container">
              <div className="connection-suggestions">
                <h2>Recommended Connections</h2>
                <div className="suggestions-grid">
                  {profileSuggestions.map((profile) => (
                    <ProfileCardHome
                      key={profile.id}
                      profile={profile}
                      onFollow={handleFollow}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="right-sidebar">
          <section className="sidebar-section trending-projects">
            <h3>Trending Projects</h3>
            <div className="project-cards">
              {trendingProjects.map(project => (
                <div key={project.id} className="project-card">
                  <h4>{project.title}</h4>
                  <p>{project.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="sidebar-section upcoming-events">
            <h3>Upcoming Events</h3>
            <div className="event-cards">
              {upcomingEvents.map(event => (
                <div key={event.id} className="event-card">
                  <h4>{event.title}</h4>
                  <p>{event.date}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* Footer */}
      <footer className="premium-footer">
        <div className="footer-links">
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/contact">Contact</a>
        </div>
        <p className="copyright">© 2024 EduVerse. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
