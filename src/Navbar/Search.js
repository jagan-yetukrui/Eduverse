import React, { useState, useEffect, useMemo } from 'react';
import './Search.css';

const Search = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  // Use useMemo to memoize the allUsers array
  const allUsers = useMemo(() => [
    { name: 'John Doe', mutuals: 5, interests: ['coding', 'AI'] },
    { name: 'Jane Smith', mutuals: 3, interests: ['design', 'UI'] },
    { name: 'Alice Johnson', mutuals: 2, interests: ['coding', 'robotics'] },
    // Add more users...
  ], []);

  // Filter suggestions as the user types in the search bar
  useEffect(() => {
    if (query.length > 0) {
      const filtered = allUsers.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) || 
        user.interests.some(interest => interest.toLowerCase().includes(query.toLowerCase()))
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query, allUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query) {
      const results = allUsers.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    }
  };

  const handleSuggestionClick = (name) => {
    setQuery(name);
    setSuggestions([]);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Search for people..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((user, index) => (
            <li key={index} onClick={() => handleSuggestionClick(user.name)}>
              {user.name} - {user.mutuals} mutual connections
            </li>
          ))}
        </ul>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          <ul>
            {searchResults.map((user, index) => (
              <li key={index}>{user.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Search;
