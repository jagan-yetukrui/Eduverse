import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Blocked = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch blocked users from the backend
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setFeedback('Please log in to view blocked users.');
          setIsLoading(false);
          return;
        }

        const response = await axios.get('/api/profiles/me/blocked-users/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && Array.isArray(response.data.blocked_users)) {
          setBlockedUsers(response.data.blocked_users);
        } else {
          setBlockedUsers([]);
          console.warn('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching blocked users:', error);
        setFeedback(error.response?.data?.message || 'Failed to load blocked users.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlockedUsers();
  }, []);

  // Handle unblocking a user
  const handleUnblockUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setFeedback('Please log in to unblock users.');
        return;
      }

      // Show loading state for feedback
      setFeedback('Unblocking user...');

      const response = await axios.post('/api/profiles/unblock-user/', {
        user_id: userId
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.success) {
        // Remove the user from the blocked users list after successful unblock
        setBlockedUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        setFeedback('User unblocked successfully!');
      } else {
        setFeedback('Unable to unblock user. Please try again.');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      setFeedback(error.response?.data?.message || 'Failed to unblock user. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="settings-section">
        <h3>Blocked Users</h3>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <h3>Blocked Users</h3>

      {blockedUsers.length === 0 ? (
        <p>No blocked users.</p>
      ) : (
        <ul className="blocked-users-list">
          {blockedUsers.map((user) => (
            <li key={user.id} className="blocked-user-item">
              <span className="user-info">
                <span className="username">{user.username}</span>
                {user.display_name && <span className="display-name">({user.display_name})</span>}
              </span>
              <button 
                className="unblock-button"
                onClick={() => handleUnblockUser(user.id)}
                disabled={isLoading}
              >
                Unblock
              </button>
            </li>
          ))}
        </ul>
      )}

      {feedback && <p className="feedback">{feedback}</p>}
    </div>
  );
};

export default Blocked;
