import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faChevronLeft, 
  faChevronRight, 
  faHeart, 
  faComment, 
  faBookmark, 
  faShare,
  faUser,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import "./PostModal.css";

const PostModal = ({ post, onClose }) => {
  const [imageIdx, setImageIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const nextImg = () => setImageIdx(i => (i + 1) % post.post_images.length);
  const prevImg = () => setImageIdx(i => (i - 1 + post.post_images.length) % post.post_images.length);

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement like functionality with API
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // TODO: Implement save functionality with API
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="post-modal-overlay" onClick={onClose}>
      <div className="post-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="post-modal-flex">
          {/* Left: Big Image */}
          <div className="post-modal-image-section">
            {post.post_images && post.post_images.length > 0 ? (
              <>
                <img 
                  src={post.post_images[imageIdx]?.image_url} 
                  alt="Post" 
                  className="post-modal-image"
                />
                {post.post_images.length > 1 && (
                  <>
                    <button className="modal-nav left" onClick={prevImg}>
                      <FontAwesomeIcon icon={faChevronLeft}/>
                    </button>
                    <button className="modal-nav right" onClick={nextImg}>
                      <FontAwesomeIcon icon={faChevronRight}/>
                    </button>
                    <div className="modal-image-counter">
                      {imageIdx + 1} / {post.post_images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="post-modal-placeholder">
                <div className="placeholder-content">
                  <div className="placeholder-icon">📝</div>
                  <p className="placeholder-text">Text post</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Right: Details */}
          <div className="post-modal-details-section">
            {/* User header */}
            <div className="post-modal-user">
              <div className="user-info">
                <div className="avatar-modal">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div className="user-details">
                  <span className="username">{post.author?.username || "Anonymous"}</span>
                  <span className="post-date">
                    <FontAwesomeIcon icon={faClock} />
                    {formatDate(post.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="post-modal-description">
              {post.title && <h3 className="modal-post-title">{post.title}</h3>}
              {post.content && <p className="modal-post-content">{post.content}</p>}
              {post.tags && post.tags.length > 0 && (
                <div className="modal-post-tags">
                  {post.tags.map((tag, idx) => (
                    <span key={idx} className="modal-post-tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="post-modal-actions">
              <button 
                className={`modal-action-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                <FontAwesomeIcon icon={faHeart} />
              </button>
              <button className="modal-action-btn">
                <FontAwesomeIcon icon={faComment} />
              </button>
              <button className="modal-action-btn" onClick={handleShare}>
                <FontAwesomeIcon icon={faShare} />
              </button>
              <button 
                className={`modal-action-btn ${isSaved ? 'saved' : ''}`}
                onClick={handleSave}
              >
                <FontAwesomeIcon icon={faBookmark} />
              </button>
            </div>

            {/* Stats */}
            <div className="post-modal-stats">
              <span className="likes-count">{post.likes_count || 0} likes</span>
              <span className="comments-count">{post.comments_count || 0} comments</span>
            </div>

            {/* Comments section */}
            <div className="post-modal-comments">
              <h4>Comments</h4>
              <div className="comments-list">
                <p className="no-comments">No comments yet.</p>
                {/* TODO: Map over post.comments when available */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal; 