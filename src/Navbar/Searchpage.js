import React, { useState, useEffect } from 'react';
import './SearchPage.css';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const allUsers = [
    { name: 'John Doe', mutuals: 5, interests: ['coding', 'AI'] },
    { name: 'Jane Smith', mutuals: 3, interests: ['design', 'UI'] },
    { name: 'Alice Johnson', mutuals: 2, interests: ['coding', 'robotics'] },
    // Add more users...
  ];

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
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query) {
      const results = allUsers.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    }
  };

  return (
    <div className="search-page">
      <h2>Search Users</h2>
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
            <li key={index}>
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

export default SearchPage;
