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
        // const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}&detailed=true`);
        const response = await fetch(
          `http://localhost:8000/api/search/?name=${encodeURIComponent(
            query
          )}&post_author=${encodeURIComponent(query)}`
        );

        const results = await response.json();
        console.log(results);

        // Delay results to sync with animation
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
          placeholder="Search anything"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={(e) => e.target.classList.add("focused")}
          onBlur={(e) => e.target.classList.remove("focused")}
          autoComplete="off"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {loading && <div className="loading-spinner">Loading...</div>}

      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((user) => (
            <li
              key={user.id}
              onClick={() => handleSuggestionClick(user.id)}
              className="suggestion-item"
            >
              <img src={user.avatar} alt={user.name} className="user-avatar" />
              <div className="user-info">
                <h3>{user.username}</h3>
                <p className="user-title">{user.title}</p>
                <div className="mutual-connections">
                  {user.mutualCount > 0 && (
                    <>
                      <span className="mutual-count">
                        {user.mutualCount} mutual connections
                      </span>
                      <div className="mutual-preview">
                        {user.mutualConnections.slice(0, 3).map((mutual) => (
                          <span key={mutual.id} className="mutual-name">
                            {mutual.name}
                          </span>
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
          <ul>
            {searchResults.map((user, index) => (
              <li
                key={user.id}
                className="result-item"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => {
                  const card = document.querySelector(
                    `[data-user-id="${user.id}"]`
                  );
                  card.classList.add("expanded");
                }}
                data-user-id={user.id}
              >
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="user-avatar"
                />
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p className="user-title">{user.title}</p>
                  <p className="user-location">{user.location}</p>
                  {user.mutualCount > 0 && (
                    <div className="mutual-connections">
                      <h5>Mutual Connections ({user.mutualCount})</h5>
                      <ul className="mutual-list">
                        {user.mutualConnections.map((mutual) => (
                          <li key={mutual.id}>{mutual.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* added new part to match the results of search api for now */}
      <div className="search-results-container">
        {showResults && (
          <div className="search-results">
            {/* <h3>Search Results</h3> */}

            {searchResults?.users?.length > 0 && (
              <div className="users-results">
                <h3>Users</h3>
                <div className="search-div"></div>
                <ul>
                  {searchResults.users.map((user) => (
                    <li key={user.username}>
                      <img
                        src={user.profile_picture || "/default-avatar.jpg"}
                        alt={user.username}
                        className="user-avatar"
                      />
                      <div className="user-info">
                        <p>{user.username}</p>
                        <div className="small-div"></div>
                        <p>{user.email}</p>
                        <p>{user.skills || "No skills listed"}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {showResults && (
          <div className="search-results">
            {/* <h3>Search Results</h3> */}
            {searchResults?.posts?.length > 0 && (
              <div className="posts-results">
                <h3>Posts</h3>
                <div className="search-div"></div>
                <ul>
                  {searchResults.posts.map((post) => (
                    <li key={post.id}>
                      <p>{post.title}</p>
                      <p>{post.author}</p>
                      <div className="small-div"></div>
                      <p>{post.content}</p>
                      <p>{post.post_type}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
