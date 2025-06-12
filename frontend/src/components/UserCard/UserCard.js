import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../../Accounts/UserContext';
import './UserCard.css';

const UserCard = ({ user }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useUser();

  const handleClick = () => {
    if (user.username === currentUser?.username) {
      navigate('/profile');
    } else {
      navigate(`/profile/${user.username}`);
    }
  };

  return (
    <motion.div 
      className="user-card"
      onClick={handleClick}
      whileHover={{ y: -5, boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="user-card-content">
        <img 
          src={user.avatar_url || '/default-avatar.png'} 
          alt={`${user.display_name || user.username}'s avatar`} 
          className="user-avatar" 
        />
        <div className="user-info">
          <h3 className="user-name">{user.display_name || user.username}</h3>
          <p className="user-username">@{user.username}</p>
          {user.bio && (
            <p className="user-bio">{user.bio.length > 60 ? `${user.bio.substring(0, 60)}...` : user.bio}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UserCard; 