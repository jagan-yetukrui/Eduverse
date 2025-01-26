import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";
import ProfileCardHome from "./ProfileCardHome";

import mockTrendingProjects from "../mockdata/trending_projects.json";
import mockUpcomingEvents from "../mockdata/upcoming_events.json";

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

              <div className="suggestions-grid project-grid">
                {mockTrendingProjects.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="project-card-header">
                      <div className="project-card-title">
                        <h3>{project.name}</h3>
                        <p>{project.description}</p>
                      </div>
                    </div>
                    <p># {project.category}</p>
                    <div className="project-card-body">
                      <p>{project.popularity}</p>
                      <p>{project.teamSize} working on this project</p>
                    </div>

                    <div className="project-card-footer">
                      <div className="project-card-stats">
                        <p>{project.likes} Likes</p>
                        <p>{project.comments} Comments</p>
                      </div>
                      <button className="project-card-button">View</button>
                    </div>
                  </div>
                ))}
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

              <div className="suggestions-grid events-grid">
                {mockUpcomingEvents.map((event) => (
                  <div key={event.id} className="project-card">
                    <div className="project-card-header">
                      <div className="project-card-title">
                        <h3>{event.eventName}</h3>
                        <p>{event.description}</p>
                      </div>
                    </div>
                    <p># {event.tags}</p>
                    <div className="project-card-footer">
                      <div className="project-card-stats">
                        <p>
                          {event.date} {event.time}
                        </p>
                        <p>{event.location}</p>
                      </div>
                      <button
                        href={event.registrationLink}
                        className="project-card-button"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                ))}
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
