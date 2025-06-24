import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FloatingMenu.css';

const FloatingMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleEscape = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const menuItems = [
    { label: 'About', path: '/about' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'Terms', path: '/terms' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <div className="floating-menu-container">
      {/* Three-dot button */}
      <button
        ref={buttonRef}
        className={`floating-menu-button ${isOpen ? 'active' : ''}`}
        onClick={handleMenuToggle}
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="three-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Popover menu */}
      {isOpen && (
        <div ref={menuRef} className="floating-menu-popover" role="menu">
          {menuItems.map((item, index) => (
            <button
              key={item.path}
              className="menu-item"
              onClick={() => handleMenuItemClick(item.path)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleMenuItemClick(item.path);
                }
              }}
              role="menuitem"
              tabIndex={0}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FloatingMenu; 