import React, { useState, useEffect, useRef } from "react";
import "./SearchPage.css";

const Search = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
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

  const animateParticle = (particle) => {
    particle.animate([
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
  };

  const animateAIOrb = () => {
    const orb = aiOrbRef.current;
    if (!orb) return;

    orb.animate([
      { transform: 'translateY(0) scale(1)', opacity: 0.8 },
      { transform: 'translateY(-10px) scale(1.1)', opacity: 1 },
      { transform: 'translateY(0) scale(1)', opacity: 0.8 }
    ], {
      duration: 2000,
      iterations: Infinity,
      easing: 'ease-in-out'
    });
  };

  // Fetch current user data on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/user/current");
        const data = await response.json();
        setCurrentUser(data);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Handle search suggestions with debouncing
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 0) {
        setLoading(true);
        try {
          const response = await fetch(
            `/api/users/search?query=${encodeURIComponent(query)}`
          );
          const users = await response.json();

          const usersWithMutuals = await Promise.all(
            users.map(async (user) => {
              const mutualsResponse = await fetch(
                `/api/users/${user.id}/mutuals`
              );
              const mutualsData = await mutualsResponse.json();
              return {
                ...user,
                mutualConnections: mutualsData.mutuals,
                mutualCount: mutualsData.count,
              };
            })
          );

          setSuggestions(usersWithMutuals);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const triggerSearchAnimation = () => {
    const resultsContainer = document.querySelector('.search-results-container');
    if (resultsContainer) {
      resultsContainer.classList.remove('fade-in');
      void resultsContainer.offsetWidth; // reflow
      resultsContainer.classList.add('fade-in');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query) {
      setLoading(true);
      setShowResults(false);
      triggerSearchAnimation();

      try {
        const response = await fetch(
          `http://localhost:8000/api/search/?name=${encodeURIComponent(
            query
          )}&post_author=${encodeURIComponent(query)}`
        );

        const results = await response.json();
        console.log(results);

        setTimeout(() => {
          setSearchResults(results);
          setLoading(false);
          setShowResults(true);
        }, 2000);
      } catch (error) {
        console.error("Error performing search:", error);
        setLoading(false);
      }
    }
  };

  const handleTagClick = (tag) => {
    setQuery(tag.label);
    handleSearch({ preventDefault: () => {} });
  };

  const handleSuggestionClick = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const userData = await response.json();
      setQuery(userData.name);
      setSearchResults([userData]);
      setSuggestions([]);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
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
              onFocus={(e) => e.target.classList.add("focused")}
              onBlur={(e) => e.target.classList.remove("focused")}
              autoComplete="off"
              className="search-input"
            />
            <button type="submit" disabled={loading} className="search-button">
              {loading ? (
                <div className="loading-spinner-small"></div>
              ) : (
                <i className="fas fa-search"></i>
              )}
            </button>
          </form>
        </div>

        <p className="search-tip">💡 Edura Tip: Try "AI Project Python" or "Open Role Data Analyst"</p>

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

      {query && suggestions.length > 0 && (
        <div className="suggestions-container fade-in">
          <ul className="suggestions-list">
            {suggestions.map((user) => (
              <li
                key={user.id}
                onClick={() => handleSuggestionClick(user.id)}
                className="suggestion-item"
              >
                <div className="suggestion-avatar">
                  <img src={user.avatar} alt={user.name} />
                </div>
                <div className="suggestion-content">
                  <h3>{user.username}</h3>
                  <p>{user.title}</p>
                  {user.mutualCount > 0 && (
                    <div className="mutual-info">
                      <span>{user.mutualCount} mutual connections</span>
                      <div className="mutual-avatars">
                        {user.mutualConnections.slice(0, 3).map((mutual) => (
                          <img key={mutual.id} src={mutual.avatar} alt={mutual.name} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="search-results-container">
        {showResults && (
          <>
            {searchResults?.users?.length > 0 && (
              <div className="results-section users-section">
                <h2>Users</h2>
                <div className="results-grid">
                  {searchResults.users.map((user) => (
                    <div key={user.username} className="user-card">
                      <div className="card-glow"></div>
                      <div className="user-card-header">
                        <img
                          src={user.profile_picture || "/default-avatar.jpg"}
                          alt={user.username}
                          className="user-avatar"
                        />
                        <h3>{user.username}</h3>
                      </div>
                      <div className="user-card-body">
                        <p className="user-email">{user.email}</p>
                        <div className="skills-container">
                          {user.skills ? (
                            user.skills.split(',').map((skill, index) => (
                              <span key={index} className="skill-tag">
                                {skill.trim()}
                              </span>
                            ))
                          ) : (
                            <p className="no-skills">No skills listed</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults?.posts?.length > 0 && (
              <div className="results-section posts-section">
                <h2>Posts</h2>
                <div className="posts-grid">
                  {searchResults.posts.map((post) => (
                    <div key={post.id} className="post-card">
                      <div className="card-glow"></div>
                      <div className="post-card-header">
                        <h3>{post.title}</h3>
                        <span className="post-type">{post.post_type}</span>
                      </div>
                      <div className="post-card-body">
                        <p className="post-author">By {post.author}</p>
                        <p className="post-content">{post.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
