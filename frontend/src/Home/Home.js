import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";
import ProfileCardHome from "./ProfileCardHome";

const Home = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileSuggestions, setProfileSuggestions] = useState([]);
  const [trendingProjects, setTrendingProjects] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    // get token from local storage
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(Boolean(token));
  }, []);

  useEffect(() => {
    fetchProfileSuggestions();
    fetchTrendingProjects();
    fetchUpcomingEvents();
  }, []);

  const fetchProfileSuggestions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/profiles/");
      const data = await response.json();
      setProfileSuggestions(data);
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
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch("/api/events/upcoming");
      const data = await response.json();
      setUpcomingEvents(data);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
    }
  };

  const handleFollow = (userId) => {
    console.log(`Follow user with ID: ${userId}`);
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
            Your premium platform for collaborative learning and professional
            growth
          </p>
        </div>
      ) : (
        <div className="welcome-section">
          <div className="feed-container">
            <div className="suggestions trending-projects">
              <div className="suggestions-title">
                <h3>Trending Projects </h3>
                <div className="divider-horizontal"></div>
              </div>

              <div className="suggestions-grid">
                Trending Projects
              </div>
            </div>

            <div className="suggestions profile-suggestions">
              <div className="suggestions-title">
                <h3>Connection</h3>
                <div className="divider-horizontal"></div>
              </div>

              <div className="suggestions-grid ">
                {profileSuggestions.map((profile) => (
                  <ProfileCardHome
                    key={profile.id}
                    profile={profile}
                    onFollow={handleFollow}
                  />
                ))}
              </div>
            </div>

            <div className="suggestions upcoming-events">
              <div className="suggestions-title">
                <h3>Upcoming Events </h3>
                <div className="divider-horizontal"></div>
              </div>

              <div className="suggestions-grid ">
                Upcoming Events
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}

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
