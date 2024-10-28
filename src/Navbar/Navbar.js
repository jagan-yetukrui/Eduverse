import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();  // Helps to determine the active page for styling

  return (
    <div className="navbar">
      <ul>
        <li className={location.pathname === '/' ? 'active' : ''}>
          <Link to="/">Home</Link>
        </li>
        <li className={location.pathname === '/search' ? 'active' : ''}>
          <Link to="/search">Search</Link>
        </li>
        <li className={location.pathname === '/messages' ? 'active' : ''}>
          <Link to="/messages">Messages</Link>
        </li>
        <li className={location.pathname === '/notes' ? 'active' : ''}>
          <Link to="/notes">Notes</Link>
        </li>
        <li className={location.pathname === '/newpost' ? 'active' : ''}>
          <Link to="/newpost">New Post</Link>
        </li>
        <li className={location.pathname === '/profile' ? 'active' : ''}>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
