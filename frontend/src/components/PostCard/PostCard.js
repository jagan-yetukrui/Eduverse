import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './PostCard.css';

const PostCard = ({ post }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <motion.div 
      className="post-card"
      onClick={handleClick}
      whileHover={{ y: -5, boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="post-card-content">
        <div className="post-header">
          <div className="post-author">
            <img 
              src={post.author.avatar_url || '/default-avatar.png'} 
              alt={`${post.author.username}'s avatar`} 
              className="author-avatar" 
            />
            <span className="author-name">@{post.author.username}</span>
          </div>
          <span className="post-type">{post.post_type}</span>
        </div>
        
        <h3 className="post-title">{post.title}</h3>
        <p className="post-content">
          {post.content.length > 150 
            ? `${post.content.substring(0, 150)}...` 
            : post.content}
        </p>
        
        <div className="post-stats">
          <span className="stat">
            <i className="fas fa-heart"></i> {post.likes_count}
          </span>
          <span className="stat">
            <i className="fas fa-comment"></i> {post.comments_count}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard; 