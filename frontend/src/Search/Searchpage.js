import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import "./SearchPage.css";
import UserCard from '../components/UserCard/UserCard';
import PostCard from '../components/PostCard/PostCard';
import { FaSearch, FaFilter } from 'react-icons/fa';
import apiClient from '../utils/api';
import defaultProfileImage from '../assets/default-profile.png';

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('all'); // 'all', 'users', 'posts'
  const [postType, setPostType] = useState('all'); // 'all', 'project', 'job', 'research'
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeoutRef = useRef(null);

  const handleSearch = useCallback(async (searchQuery) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults({ users: [], posts: [] });
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          query: searchQuery,
          type: searchType,
          exclude_self: "false",
          ...(postType !== 'all' && { post_type: postType }),
          ...(timeFilter !== 'all' && { time: timeFilter })
        });

        const response = await apiClient.get(`https://edu-verse.in/api/search/?${params.toString()}`);
        setSearchResults(response.data);
      } catch (err) {
        console.error('Search error:', err);
        setError(err.message || 'Failed to perform search');
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [searchType, postType, timeFilter]);

  useEffect(() => {
    handleSearch(query);
  }, [query, handleSearch]);

  const FilterButton = ({ active, onClick, children }) => (
    <button
      className={`filter-button ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  const formatDisplayName = (user) => {
    if (user.display_name) return user.display_name;
    const fullName = `${user.first_name} ${user.last_name}`.trim();
    return fullName || `@${user.username}`;
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>Search EduVerse</h1>
        <div className="search-input-container">
          <FaSearch className="search-icon" />
            <input
              type="text"
            className="search-input"
            placeholder="Search users, posts, and more..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            </button>
        </div>

        <div className="search-type-tabs">
          <FilterButton
            active={searchType === 'all'}
            onClick={() => setSearchType('all')}
          >
            All
          </FilterButton>
          <FilterButton
            active={searchType === 'users'}
            onClick={() => setSearchType('users')}
            >
            Users
          </FilterButton>
          <FilterButton
            active={searchType === 'posts'}
            onClick={() => setSearchType('posts')}
          >
            Posts
          </FilterButton>
        </div>

        {showFilters && (
          <motion.div 
            className="search-filters"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="filter-section">
              <h3>Post Type</h3>
              <div className="filter-buttons">
                <FilterButton
                  active={postType === 'all'}
                  onClick={() => setPostType('all')}
                >
                  All Types
                </FilterButton>
                <FilterButton
                  active={postType === 'project'}
                  onClick={() => setPostType('project')}
                >
                  Projects
                </FilterButton>
                <FilterButton
                  active={postType === 'job'}
                  onClick={() => setPostType('job')}
                >
                  Jobs
                </FilterButton>
                <FilterButton
                  active={postType === 'research'}
                  onClick={() => setPostType('research')}
                >
                  Research
                </FilterButton>
              </div>
            </div>

            <div className="filter-section">
              <h3>Time Range</h3>
              <div className="filter-buttons">
                <FilterButton
                  active={timeFilter === 'all'}
                  onClick={() => setTimeFilter('all')}
                >
                  All Time
                </FilterButton>
                <FilterButton
                  active={timeFilter === 'today'}
                  onClick={() => setTimeFilter('today')}
                >
                  Today
                </FilterButton>
                <FilterButton
                  active={timeFilter === 'week'}
                  onClick={() => setTimeFilter('week')}
                >
                  This Week
                </FilterButton>
                <FilterButton
                  active={timeFilter === 'month'}
                  onClick={() => setTimeFilter('month')}
                >
                  This Month
                </FilterButton>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Searching...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <h2>Error Loading Results</h2>
          <p>{error}</p>
          <button 
            onClick={() => {
              setError(null);
              handleSearch(query);
            }}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      ) : (
          <>
          {searchType !== 'posts' && searchResults.users.length > 0 && (
            <div className="search-section">
                <h2>Users</h2>
              <div className="search-results-grid">
                {searchResults.users.map(user => (
                  <div 
                    key={user.username}
                    onClick={() => handleUserClick(user.username)}
                    style={{ cursor: 'pointer' }}
                  >
                    <UserCard 
                      user={{
                        ...user,
                        display_name: formatDisplayName(user),
                        profile_image: user.profile_image || defaultProfileImage
                      }}
                    />
                  </div>
                  ))}
                </div>
              </div>
            )}

          {searchType !== 'users' && searchResults.posts.length > 0 && (
            <div className="search-section">
                <h2>Posts</h2>
              <div className="search-results-grid">
                {searchResults.posts.map(post => (
                  <PostCard 
                    key={post.id}
                    post={{
                      ...post,
                      author: {
                        ...post.author,
                        display_name: formatDisplayName(post.author),
                        profile_image: post.author.profile_image || defaultProfileImage
                      }
                    }}
                  />
                  ))}
                </div>
              </div>
            )}

          {!loading && query && 
           searchResults.users.length === 0 && 
           searchResults.posts.length === 0 && (
            <div className="no-results">
              <p>No results found for "{query}"</p>
              <p className="no-results-suggestion">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
          </>
        )}
    </div>
  );
};

export default Search;
