import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Blocked = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [feedback, setFeedback] = useState('');

  // Fetch blocked users from the backend
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming JWT authentication
        const response = await axios.get('http://localhost:5002/api/user/blocked-users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlockedUsers(response.data.blockedUsers);
      } catch (error) {
        console.error('Error fetching blocked users:', error);
        setFeedback('Failed to load blocked users.');
      }
    };
    fetchBlockedUsers();
  }, []);

  // Handle unblocking a user
  const handleUnblockUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5002/api/user/unblock/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the user from the blocked users list after successful unblock
      setBlockedUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      setFeedback('User unblocked successfully!');
    } catch (error) {
      console.error('Error unblocking user:', error);
      setFeedback('Failed to unblock user.');
    }
  };

  return (
    <div className="settings-section">
      <h3>Blocked Users</h3>

      {blockedUsers.length === 0 ? (
        <p>No blocked users.</p>
      ) : (
        <ul className="blocked-users-list">
          {blockedUsers.map((user) => (
            <li key={user.id}>
              <span>{user.username}</span>
              <button onClick={() => handleUnblockUser(user.id)}>Unblock</button>
            </li>
          ))}
        </ul>
      )}

      {feedback && <p className="feedback">{feedback}</p>}
    </div>
  );
};

export default Blocked;
