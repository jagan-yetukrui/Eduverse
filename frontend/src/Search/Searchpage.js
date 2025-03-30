import React, { useState, useEffect, useRef } from "react";
import "./SearchPage.css";

const Search = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef(null);
  const searchBarRef = useRef(null);

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
    const container = searchContainerRef.current;
    const rocket = document.createElement("div");
    rocket.className = "rocket";
    container.appendChild(rocket);

    setTimeout(() => {
      rocket.remove();
      setShowResults(true);
    }, 2000);
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
        }, 2000);
      } catch (error) {
        console.error("Error performing search:", error);
        setLoading(false);
      }
    }
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
      <form onSubmit={handleSearch} className="search-bar" ref={searchBarRef}>
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

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Searching the universe...</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="suggestions-container">
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
