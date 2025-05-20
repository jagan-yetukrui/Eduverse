import React from 'react';
import './PostCard.css';

const PostCard = ({ post }) => {
  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-type">{post.type || "General"}</div>
        <div className="post-meta">
          <span className="post-author">@{post.author || "Anonymous"}</span>
          <span className="post-date">{post.date || "Just now"}</span>
        </div>
      </div>

      <div className="post-content">
        <h3 className="post-title">{post.title || "Untitled Post"}</h3>
        <p>{post.content || "No content available."}</p>
      </div>

      {/* Optional: Tags */}
      {post.tags?.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="post-tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostCard; 