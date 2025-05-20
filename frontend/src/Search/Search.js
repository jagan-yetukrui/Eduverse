import React, { useState, useEffect, useRef } from 'react';
import './Search.css';

const Search = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [searchTags] = useState([
    { id: 1, label: 'AI Projects', icon: '🤖' },
    { id: 2, label: 'Mentors', icon: '👨‍🏫' },
    { id: 3, label: 'Hackathons', icon: '💻' },
    { id: 4, label: 'Research', icon: '🔬' },
    { id: 5, label: 'Startups', icon: '🚀' }
  ]);
  const searchContainerRef = useRef(null);
  const searchBarRef = useRef(null);
  const aiOrbRef = useRef(null);

  // Initialize page load animations
  useEffect(() => {
    const container = searchContainerRef.current;
    container.classList.add('fade-in');
    
    // Initialize particle effects
    const particles = Array.from({ length: 50 }, () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      container.appendChild(particle);
      return particle;
    });

    particles.forEach(particle => {
      animateParticle(particle);
    });

    // Slide in search bar
    searchBarRef.current.classList.add('slide-in');

    // Animate AI orb
    if (aiOrbRef.current) {
      animateAIOrb();
    }

    return () => {
      particles.forEach(particle => particle.remove());
    };
  }, []);

  // Fetch current user data on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/user/current');
        const data = await response.json();
        setCurrentUser(data);
      } catch (error) {
        console.error('Error fetching current user:', error);
        setCurrentUser(null);
      }
    };
    fetchCurrentUser();
  }, []);

  // Handle search suggestions with debouncing
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 0) {
        if (!currentUser) {
          setShowLoginPopup(true);
          return;
        }
        
        setLoading(true);
        try {
          const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`);
          const users = await response.json();
          
          const usersWithMutuals = await Promise.all(
            users.map(async (user) => {
              const mutualsResponse = await fetch(`/api/users/${user.id}/mutuals`);
              const mutualsData = await mutualsResponse.json();
              return {
                ...user,
                mutualConnections: mutualsData.mutuals,
                mutualCount: mutualsData.count
              };
            })
          );
          
          setSuggestions(usersWithMutuals);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, currentUser]);

  const animateParticle = (particle) => {
    const animation = particle.animate([
      { 
        transform: `translate(${Math.random() * 100}vw, ${Math.random() * 100}vh)`,
        opacity: 0
      },
      {
        transform: `translate(${Math.random() * 100}vw, ${Math.random() * 100}vh)`,
        opacity: 0.5
      }
    ], {
      duration: 3000 + Math.random() * 2000,
      iterations: Infinity
    });
    return animation;
  };

  const animateAIOrb = () => {
    const orb = aiOrbRef.current;
    if (!orb) return;

    const animation = orb.animate([
      { transform: 'translateY(0) scale(1)', opacity: 0.8 },
      { transform: 'translateY(-10px) scale(1.1)', opacity: 1 },
      { transform: 'translateY(0) scale(1)', opacity: 0.8 }
    ], {
      duration: 2000,
      iterations: Infinity,
      easing: 'ease-in-out'
    });
  };

  const triggerSearchAnimation = () => {
    const container = searchContainerRef.current;
    const rocket = document.createElement('div');
    rocket.className = 'rocket';
    container.appendChild(rocket);

    setTimeout(() => {
      rocket.remove();
      setShowResults(true);
    }, 2000);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setShowLoginPopup(true);
      return;
    }
    
    if (query) {
      setLoading(true);
      setShowResults(false);
      triggerSearchAnimation();

      try {
        const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}&detailed=true`);
        const results = await response.json();
        
        setTimeout(() => {
          setSearchResults(results);
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error performing search:', error);
        setLoading(false);
      }
    }
  };

  const handleSuggestionClick = async (userId) => {
    if (!currentUser) {
      setShowLoginPopup(true);
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${userId}`);
      const userData = await response.json();
      setQuery(userData.name);
      setSearchResults([userData]);
      setSuggestions([]);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleTagClick = (tag) => {
    setQuery(tag.label);
    handleSearch({ preventDefault: () => {} });
  };

  const closeLoginPopup = () => {
    setShowLoginPopup(false);
  };

  return (
    <div className="search-container" ref={searchContainerRef}>
      <div className="search-hero">
        <h1>Discover Minds. Explore Projects.</h1>
        <p>Search across EduVerse to find users, AI projects, open roles, and more.</p>
        
        <div className="search-bar-container" ref={searchBarRef}>
          <div className="ai-orb" ref={aiOrbRef}>
            <span className="orb-icon">🤖</span>
            <div className="orb-ring"></div>
          </div>
          
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Search for users, posts, and more..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={(e) => e.target.classList.add('focused')}
              onBlur={(e) => e.target.classList.remove('focused')}
              autoComplete="off"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Searching...' : '🔍'}
            </button>
          </form>
        </div>

        <div className="search-tags">
          {searchTags.map(tag => (
            <button
              key={tag.id}
              className="search-tag"
              onClick={() => handleTagClick(tag)}
            >
              <span className="tag-icon">{tag.icon}</span>
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Edura is searching...</p>
        </div>
      )}

      {showLoginPopup && (
        <div className="login-popup">
          <div className="login-popup-content">
            <h3>Login Required</h3>
            <p>You need to be logged in to search for users.</p>
            <div className="login-popup-buttons">
              <button onClick={closeLoginPopup}>Close</button>
              <a href="/login" className="login-button">Login</a>
            </div>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((user) => (
            <li key={user.id} onClick={() => handleSuggestionClick(user.id)} className="suggestion-item">
              <img src={user.profileImage} alt={user.name} className="user-avatar" />
              <div className="user-info">
                <h4>{user.name}</h4>
                <p className="user-title">{user.title}</p>
                <div className="mutual-connections">
                  {user.mutualCount > 0 && (
                    <>
                      <span className="mutual-count">{user.mutualCount} mutual connections</span>
                      <div className="mutual-preview">
                        {user.mutualConnections.slice(0, 3).map(mutual => (
                          <span key={mutual.id} className="mutual-name">{mutual.name}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showResults && searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          <div className="results-grid">
            {searchResults.map((user, index) => (
              <div 
                key={user.id} 
                className="result-card"
                style={{animationDelay: `${index * 0.1}s`}}
                onClick={() => {
                  const card = document.querySelector(`[data-user-id="${user.id}"]`);
                  card.classList.add('expanded');
                }}
                data-user-id={user.id}
              >
                <div className="card-glow"></div>
                <img src={user.profileImage} alt={user.name} className="user-avatar" />
                <div className="user-info">
                  <h4>{user.name}</h4>
                  <p className="user-title">{user.title}</p>
                  <p className="user-location">{user.location}</p>
                  {user.mutualCount > 0 && (
                    <div className="mutual-connections">
                      <h5>Mutual Connections ({user.mutualCount})</h5>
                      <ul className="mutual-list">
                        {user.mutualConnections.map(mutual => (
                          <li key={mutual.id}>{mutual.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
