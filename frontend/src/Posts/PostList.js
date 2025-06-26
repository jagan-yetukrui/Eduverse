import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, 
  faComment, 
  faShare, 
  faBookmark,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

import "./PostList.css";

function PostList() {
  const [posts, setPosts] = useState([]);
  const [imageIndices, setImageIndices] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          console.error("No token found. Please log in.");
          // window.location.href = "/login";
          return;
        }

        // Make the API request with the Authorization header
        const response = await axios.get("http://localhost:8000/api/posts/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Set the posts state with the response data
        setPosts(response.data);
        
        // Initialize image indices for each post
        const initialIndices = {};
        response.data.forEach(post => {
          if (post.post_images && post.post_images.length > 0) {
            initialIndices[post.id] = 0;
          }
        });
        setImageIndices(initialIndices);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  const nextImage = (postId) => {
    setImageIndices(prev => ({
      ...prev,
      [postId]: (prev[postId] + 1) % posts.find(p => p.id === postId).post_images.length
    }));
  };

  const prevImage = (postId) => {
    const post = posts.find(p => p.id === postId);
    setImageIndices(prev => ({
      ...prev,
      [postId]: (prev[postId] - 1 + post.post_images.length) % post.post_images.length
    }));
  };

  return (
    <div className="post-list">
      {/* {posts.length === 0 ? (
        <p>No posts available yet. Be the first to create one!</p>
      ) : (
        posts.map((post) => (
          <div key={post.id}>
            <h3>{post.post_type}</h3>
            <p>{post.content}</p>
            <small>
              Posted on {new Date(post.created_at).toLocaleDateString()}
            </small>
          </div>
        ))
      )} */}
      {posts.map((post) => (
        <div className="post-container" key={post.id}>
          <div className="post-header">
            <div className="post-author">
              <img 
                src={post.author?.profile_picture || '/default-avatar.png'} 
                alt={`${post.author?.username || 'User'}'s avatar`} 
                className="author-avatar" 
              />
              <div className="author-info">
                <span className="author-name">{post.author?.username || 'Anonymous'}</span>
                <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <span className="post-type">{post.post_type}</span>
          </div>

          <div className="post-content">
            <h3 className="post-title">{post.title}</h3>
            <p className="post-text">{post.content}</p>
          </div>

          {/* Multiple Images Display */}
          {post.post_images && post.post_images.length > 0 && (
            <div className="post-images">
              <div className="image-container">
                <img 
                  src={post.post_images[imageIndices[post.id] || 0]?.image_url} 
                  alt={`Post image ${imageIndices[post.id] || 0 + 1}`}
                  className="post-image"
                />
                
                {/* Navigation arrows for multiple images */}
                {post.post_images.length > 1 && (
                  <>
                    <button 
                      className="image-nav prev" 
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage(post.id);
                      }}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button 
                      className="image-nav next" 
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage(post.id);
                      }}
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                    <div className="image-counter">
                      {(imageIndices[post.id] || 0) + 1} / {post.post_images.length}
                    </div>
                  </>
                )}
              </div>
              
              {/* Image thumbnails */}
              {post.post_images.length > 1 && (
                <div className="image-thumbnails">
                  {post.post_images.map((image, index) => (
                    <div 
                      key={index} 
                      className={`thumbnail ${index === (imageIndices[post.id] || 0) ? 'active' : ''}`}
                      onClick={() => setImageIndices(prev => ({ ...prev, [post.id]: index }))}
                    >
                      <img src={image.image_url} alt={`Thumbnail ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Post actions */}
          <div className="post-actions">
            <button className="action-btn">
              <FontAwesomeIcon icon={faHeart} />
              <span>{post.likes_count || 0}</span>
            </button>
            <button className="action-btn">
              <FontAwesomeIcon icon={faComment} />
              <span>{post.comments_count || 0}</span>
            </button>
            <button className="action-btn">
              <FontAwesomeIcon icon={faShare} />
            </button>
            <button className="action-btn">
              <FontAwesomeIcon icon={faBookmark} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PostList;
