import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faImage, 
  faHashtag, 
  faPaperPlane,
  faSpinner,
  faTimes,
  faCamera,
  faMapMarkerAlt,
  faUserPlus,
  faAt,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import "./NewPost.css";

const NewPost = ({ onPostCreated }) => {
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [location, setLocation] = useState("");
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [tagInput, setTagInput] = useState("");
  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  const handleMultipleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setErrors(["You can upload a maximum of 5 images"]);
      return;
    }

    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages([...images, ...previews]);
    setErrors([]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
    if (currentImageIndex >= newImages.length) {
      setCurrentImageIndex(Math.max(0, newImages.length - 1));
    }
  };

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim() !== '') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, '');
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleAddCollaborator = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && collaboratorInput.trim() !== '') {
      e.preventDefault();
      const newCollaborator = collaboratorInput.trim().replace(/,$/, '');
      if (!collaborators.includes(newCollaborator)) {
        setCollaborators([...collaborators, newCollaborator]);
      }
      setCollaboratorInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const removeCollaborator = (collaboratorToRemove) => {
    setCollaborators(collaborators.filter(collab => collab !== collaboratorToRemove));
  };

  const validatePost = () => {
    const newErrors = [];
    if (!caption.trim() && images.length === 0) {
      newErrors.push("Please add a caption or at least one image");
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePost() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Get token from localStorage (support both 'access_token' and 'token')
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const formData = new FormData();
      formData.append('content', caption.trim());
      
      // Append all images with the same field name 'images'
      images.forEach((image) => {
        formData.append('images', image.file);
      });
      
      // Set post_type based on content
      const postType = images.length > 0 ? 'image' : 'text';
      formData.append('post_type', postType);
      
      formData.append('tags', JSON.stringify(tags));
      formData.append('collaborators', JSON.stringify(collaborators));
      formData.append('location', location.trim());

      const response = await fetch("http://localhost:8000/api/posts/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setCaption("");
        setTags([]);
        setCollaborators([]);
        setLocation("");
        setImages([]);
        setCurrentImageIndex(0);
        if (onPostCreated) {
          onPostCreated();
        }
      } else {
        const errorData = await response.json();
        console.error('POST /api/posts/ error:', errorData);
        throw new Error(errorData.detail || JSON.stringify(errorData) || "Failed to create post");
      }
    } catch (err) {
      setErrors([err.message]);
      console.error('Post creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="post-card">
      {/* Left Side - Image Section */}
      <div className="image-section">
        <div className="image-upload-section">
          {images.length > 0 ? (
            <div className="image-preview-container">
              <img 
                src={images[currentImageIndex].preview} 
                alt={`Preview ${currentImageIndex + 1}`} 
                className="image-preview" 
              />
              <button
                type="button"
                className="remove-image"
                onClick={() => removeImage(currentImageIndex)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
              {images.length > 1 && (
                <>
                  <button 
                    className="carousel-nav prev" 
                    onClick={prevImage}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <button 
                    className="carousel-nav next" 
                    onClick={nextImage}
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                  <div className="image-counter">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div 
              className="upload-placeholder"
              onClick={() => fileInputRef.current.click()}
            >
              <FontAwesomeIcon icon={faCamera} className="icon" />
              <span className="text">Add Photos</span>
              <span className="subtext">Drag and drop or click to upload (max 5)</span>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleMultipleImageUpload}
            accept="image/*"
            multiple
            style={{ display: "none" }}
          />
        </div>
        {images.length > 0 && (
          <div className="image-thumbnails">
            {images.map((image, index) => (
              <div 
                key={index} 
                className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img src={image.preview} alt={`Thumbnail ${index + 1}`} />
              </div>
            ))}
            {images.length < 5 && (
              <div 
                className="add-more-thumbnail"
                onClick={() => fileInputRef.current.click()}
              >
                <FontAwesomeIcon icon={faCamera} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side - Form Section */}
      <div className="form-section">
        <h2 className="post-title">Create Post</h2>

        <form onSubmit={handleSubmit} className="post-form">
          {/* Caption Input */}
          <div className="caption-section">
            <div className="section-header">
              <FontAwesomeIcon icon={faImage} className="section-icon" />
              <span className="section-label">Caption</span>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Share what you're working on... @mention someone"
              className="caption-input"
              rows={4}
            />
          </div>

          {/* Location Input */}
          <div className="input-section">
            <div className="section-header">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="section-icon" />
              <span className="section-label">Location</span>
            </div>
            <div className="input-container">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add a location"
                className="location-input"
              />
            </div>
          </div>

          {/* Collaborators Section */}
          <div className="collaborators-section">
            <div className="section-header">
              <FontAwesomeIcon icon={faUserPlus} className="section-icon" />
              <span className="section-label">Collaborators</span>
            </div>
            <div className="input-container">
              <FontAwesomeIcon icon={faUserPlus} className="input-icon" />
              <input
                type="text"
                value={collaboratorInput}
                onChange={(e) => setCollaboratorInput(e.target.value)}
                onKeyDown={handleAddCollaborator}
                placeholder="Tag collaborators (@username)"
                className="collaborator-input"
              />
            </div>
            <div className="collaborator-display">
              {collaborators.map((collab, index) => (
                <span key={index} className="collaborator-chip">
                  @{collab}
                  <button
                    type="button"
                    onClick={() => removeCollaborator(collab)}
                    className="remove-collaborator"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tags Section */}
          <div className="tags-section">
            <div className="section-header">
              <FontAwesomeIcon icon={faHashtag} className="section-icon" />
              <span className="section-label">Tags</span>
            </div>
            <div className="input-container">
              <FontAwesomeIcon icon={faHashtag} className="input-icon" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags (e.g. #ai #startups #dev)"
                className="tag-input"
              />
            </div>
            <div className="tag-display">
              {tags.map((tag, index) => (
                <span key={index} className="tag-chip">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="remove-tag"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <p key={index} className="error">{error}</p>
              ))}
            </div>
          )}

          {/* Post Button */}
          <button 
            type="submit" 
            className="post-button"
            disabled={isSubmitting || (!caption.trim() && images.length === 0)}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Posting...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPaperPlane} /> Post
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPost;

