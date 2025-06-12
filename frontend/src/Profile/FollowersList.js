import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaSearch } from 'react-icons/fa';
import './FollowersList.css';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const FollowersList = ({ type, username }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `https://edu-verse.in/api/profiles/${username}/${type}/`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch users';
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [type, username]);

  const handleFollow = async (userId) => {
    try {
      setLoadingStates(prev => ({ ...prev, [userId]: true }));
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `https://edu-verse.in/api/profiles/${userId}/follow/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_following: true } : user
      ));
      
      if (response.data.status === 'following') {
        toast.success('Successfully followed user');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to follow user';
      toast.error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      setLoadingStates(prev => ({ ...prev, [userId]: true }));
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `https://edu-verse.in/api/profiles/${userId}/unfollow/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_following: false } : user
      ));
      
      if (response.data.status === 'unfollowed') {
        toast.success('Successfully unfollowed user');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to unfollow user';
      toast.error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, [userId]: false }));
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    (user.display_name && user.display_name.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <motion.div 
      className="followers-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="followers-header">
        <h2>{type === 'followers' ? 'Followers' : 'Following'} ({users.length})</h2>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-card">
          <p>{search ? 'No users found matching your search.' : `No ${type} yet.`}</p>
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map(user => (
            <motion.div 
              key={user.id} 
              className="user-card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img 
                src={user.avatar || '/placeholder.png'} 
                alt={user.username} 
                className="user-avatar"
              />
              <div className="user-info">
                <h3>{user.display_name || user.username}</h3>
                <p className="username">@{user.username}</p>
                {user.bio && <p className="bio">{user.bio}</p>}
              </div>
              <button
                className={`follow-button ${user.is_following ? 'following' : ''}`}
                onClick={() => user.is_following ? handleUnfollow(user.id) : handleFollow(user.id)}
                disabled={loadingStates[user.id]}
              >
                {loadingStates[user.id] ? 'Processing...' : user.is_following ? 'Unfollow' : 'Follow'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default FollowersList; 