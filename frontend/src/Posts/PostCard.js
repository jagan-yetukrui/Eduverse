import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, 
  faComment, 
  faShare, 
  faBookmark,
  faChevronLeft,
  faChevronRight,
  faUser,
  faClock,
  faImages
} from '@fortawesome/free-solid-svg-icons';
import './PostCard.css';

const PostCard = ({ post, onClick, isGrid = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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

  const nextImage = () => {
    if (post.post_images && post.post_images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % post.post_images.length);
    }
  };

  const prevImage = () => {
    if (post.post_images && post.post_images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + post.post_images.length) % post.post_images.length);
    }
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

  // Show only the first line of content for grid view
  const firstLine = post.content ? post.content.split('\n')[0].slice(0, 90) : '';

  // Grid view (Instagram profile style)
  if (isGrid) {
    return (
      <div className="post-card insta" onClick={onClick} tabIndex={0}>
        <div className="insta-image-wrapper">
          <img
            src={post.post_images && post.post_images[0]?.image_url}
            alt={firstLine || "Post"}
            className="insta-post-image"
          />
          {/* Show if multiple images */}
          {post.post_images && post.post_images.length > 1 && (
            <div className="multiple-images-overlay">
              <FontAwesomeIcon icon={faImages} />
            </div>
          )}
          {/* Overlay for likes/comments on hover */}
          <div className="insta-hover-overlay">
            <div className="insta-stats-row">
              <span>
                <FontAwesomeIcon icon={faHeart} /> {post.likes_count || 0}
              </span>
              <span>
                <FontAwesomeIcon icon={faComment} /> {post.comments_count || 0}
              </span>
            </div>
            {firstLine && <div className="insta-caption-preview">{firstLine}</div>}
          </div>
        </div>
      </div>
    );
  }

  // Full view (for feed or detailed view)
  return (
    <div className="post-card insta">
      {/* Post Header (small, left-aligned) */}
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className="author-info">
            <span className="author-name">{post.author?.username || 'Anonymous'}</span>
            <span className="post-date">
              <FontAwesomeIcon icon={faClock} />
              {formatDate(post.created_at)}
            </span>
          </div>
        </div>
        <div className="post-type-badge">
          {post.post_type || 'post'}
        </div>
      </div>

      {/* Image: square, centered */}
      {post.post_images && post.post_images.length > 0 ? (
        <div className="insta-image-wrapper">
          <img
            src={post.post_images[currentImageIndex]?.image_url}
            alt={`Post image ${currentImageIndex + 1}`}
            className="insta-post-image"
          />
          {/* Multiple images indicator for profile grid */}
          {post.post_images.length > 1 && (
            <div className="multiple-images-overlay">
              <FontAwesomeIcon icon={faImages} />
            </div>
          )}
          {/* Arrows for multiple images */}
          {post.post_images.length > 1 && (
            <>
              <button className="image-nav prev" onClick={prevImage}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button className="image-nav next" onClick={nextImage}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
              <div className="image-counter">
                {currentImageIndex + 1} / {post.post_images.length}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Placeholder for posts without images */
        <div className="post-placeholder">
          <div className="placeholder-content">
            <div className="placeholder-icon">📝</div>
            <p className="placeholder-text">
              {post.content ? 'Text post' : 'No content'}
            </p>
          </div>
        </div>
      )}

      {/* Actions row */}
      <div className="post-actions">
        <button 
          className={`action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <FontAwesomeIcon icon={faHeart} />
          <span>{post.likes_count || 0}</span>
        </button>
        <button className="action-btn">
          <FontAwesomeIcon icon={faComment} />
          <span>{post.comments_count || 0}</span>
        </button>
        <button className="action-btn" onClick={handleShare}>
          <FontAwesomeIcon icon={faShare} />
        </button>
        <button 
          className={`action-btn ${isSaved ? 'saved' : ''}`}
          onClick={handleSave}
        >
          <FontAwesomeIcon icon={faBookmark} />
        </button>
      </div>

      {/* Caption/Description BELOW the image/actions */}
      <div className="insta-description">
        {post.title && <h3 className="post-title">{post.title}</h3>}
        {post.content && <p className="post-text">{post.content}</p>}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="post-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard; 