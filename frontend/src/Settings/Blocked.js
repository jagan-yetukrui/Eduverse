import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Blocked.css';

const Blocked = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch blocked users from the backend
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setFeedback({
            message: 'Please log in to view blocked users.',
            type: 'error'
          });
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/profiles/me/blocked/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBlockedUsers(response.data.blocked_users || []);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlockedUsers();
  }, [navigate]);

  // Handle errors
  const handleError = (error) => {
    console.error('Error:', error);
    const errorMessage = error.response?.data?.detail || error.message;
    setFeedback({
      message: errorMessage,
      type: 'error'
    });

    if (error.response?.status === 401) {
      navigate('/login');
    }
  };

  // Handle unblocking a user
  const handleUnblockUser = async (username) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      await axios.delete(`/api/profiles/${username}/unfollow/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the user from the blocked users list
      setBlockedUsers(prevUsers => 
        prevUsers.filter(user => user.username !== username)
      );

      setFeedback({
        message: `Successfully unblocked ${username}`,
        type: 'success'
      });

    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter blocked users based on search query
  const filteredUsers = blockedUsers.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && blockedUsers.length === 0) {
    return (
      <div className="blocked-users-container">
        <h2>Blocked Users</h2>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="blocked-users-container">
      <h2>Blocked Users</h2>
      
      {/* Search input */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search blocked users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Feedback message */}
      {feedback.message && (
        <div className={`feedback-message ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {/* Blocked users list */}
      {filteredUsers.length === 0 ? (
        <div className="no-users-message">
          {searchQuery 
            ? "No blocked users match your search"
            : "You haven't blocked any users"}
        </div>
      ) : (
        <ul className="blocked-users-list">
          {filteredUsers.map((user) => (
            <li key={user.username} className="blocked-user-item">
              <div className="user-info">
                {user.avatar && (
                  <img 
                    src={user.avatar} 
                    alt={`${user.username}'s avatar`} 
                    className="user-avatar"
                  />
                )}
                <div className="user-details">
                  <span className="username">{user.username}</span>
                  {user.display_name && (
                    <span className="display-name">{user.display_name}</span>
                  )}
                </div>
              </div>
              <button 
                className="unblock-button"
                onClick={() => handleUnblockUser(user.username)}
                disabled={isLoading}
              >
                {isLoading ? 'Unblocking...' : 'Unblock'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Blocked;
