import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css';
import FirstLogo from '../First_logo.png';  // Main Logo
import HomeIcon from '../Home_image.png';  // Home icon
import SearchIcon from '../Search_image.png';  // Search icon
import MessagesIcon from '../Messages_image.png';  // Messages icon
import NotesIcon from '../Notes_image.png';  // Notes icon
import NewPostIcon from '../Newpost_image.png';  // New Post icon
import ProfileIcon from '../Profile_image.png';  // Profile icon

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated (if token exists in localStorage)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true); // User is logged in
    } else {
      setIsAuthenticated(false); // User is not logged in
    }
  }, []);

  const goToPage = (path) => {
    navigate(path);
  };

  return (
    <div className="home-container">
      {/* Logo at the top left */}
      <div className="top-logo">
        <img src={FirstLogo} alt="EduVerse Logo" className="logo" />
      </div>

      {/* Main Feed */}
      <div className="main-feed">
        {location.pathname === '/' ? (
          <>
            <h1>Welcome to EduVerse</h1>
            <p>Your platform for collaborative learning and growth.</p>
            {!isAuthenticated ? (
              <div>
                <p>Please log in or register to access full features.</p>
                <div className="home-buttons">
                  <button onClick={() => goToPage('/login')} className="home-button">Login</button>
                  <button onClick={() => goToPage('/register')} className="home-button">Register</button>
                </div>
              </div>
            ) : (
              <div>
                <p>Explore posts, connect with others, and enjoy!</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Render different pages dynamically */}
            {location.pathname === '/messages' && <h2>Your Messages</h2>}
            {location.pathname === '/notes' && <h2>Your Notes</h2>}
            {location.pathname === '/newpost' && (
              <div className="new-post-page">
                <h2>Create a New Post</h2>
                {/* Add New Post Logic */}
              </div>
            )}
            {location.pathname === '/profile' && (
              <div className="profile-page">
                <h2>Edit Profile</h2>
                {/* Add Profile Editing Logic */}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation Bar (always present) */}
      <div className="bottom-navbar">
        <ul>
          <li onClick={() => goToPage('/')} className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <img src={HomeIcon} alt="Home" />
          </li>
          <li onClick={() => goToPage('/search')} className={`nav-item ${location.pathname === '/search' ? 'active' : ''}`}>
            <img src={SearchIcon} alt="Search" />
          </li>
          <li onClick={() => goToPage('/messages')} className={`nav-item ${location.pathname === '/messages' ? 'active' : ''}`}>
            <img src={MessagesIcon} alt="Messages" />
          </li>
          <li onClick={() => goToPage('/notes')} className={`nav-item ${location.pathname === '/notes' ? 'active' : ''}`}>
            <img src={NotesIcon} alt="Notes" />
          </li>
          <li onClick={() => goToPage('/newpost')} className={`nav-item ${location.pathname === '/newpost' ? 'active' : ''}`}>
            <img src={NewPostIcon} alt="New Post" />
          </li>
          <li onClick={() => goToPage('/profile')} className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
            <img src={ProfileIcon} alt="Profile" />
          </li>
        </ul>
      </div>
    </div>
  )
};

export default Home;
