import React, { useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "./NewPost.css";
import { useNavigate } from "react-router-dom";

const NewPost = ({ isOpen, onClose }) => {
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [files, setFiles] = useState([]);
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const categories = ["Post", "Project", "Research", "Job", "Service"];

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const validatePost = () => {
    const newErrors = [];
    if (!postTitle.trim()) {
      newErrors.push("Title is required");
    }
    if (!postContent.trim()) {
      newErrors.push("Post content is required");
    }
    if (!selectedCategory) {
      newErrors.push("Please select a category");
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validatePost() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", postTitle.trim());
      formData.append("content", postContent.trim());
      formData.append("category", selectedCategory);
      files.forEach((file) => formData.append("files", file));

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch("http://localhost:8000/api/posts/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        onClose();
        navigate("/posts");
      } else {
        throw new Error("Failed to create post");
      }
    } catch (err) {
      setErrors([err.message]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="holographic-panel modal-content">
        <div className="modal-header">
          <h2 className="neon-text">
            {isPreview ? "Preview Post" : "Create New Post"}
          </h2>
          <button className="close-button cyber-button" onClick={onClose}>
            &times;
          </button>
        </div>

        {!isPreview ? (
          <div className="modal-body">
            <div className="input-group">
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Enter post title..."
                className="cyber-input title-input"
                maxLength={100}
              />
            </div>

            <div className="input-group">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="cyber-select category-select"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <Editor
              apiKey="vzy136fy9hej20t0rxfpxu19mooxienl5owvp1v3af6w09di"
              value={postContent}
              onEditorChange={(content) => setPostContent(content)}
              init={{
                height: 300,
                menubar: false,
                plugins: ["lists", "link"],
                toolbar: "bold italic underline | bullist numlist | link",
                content_style:
                  'body { font-family: "Orbitron", sans-serif; font-size:14px; background: rgba(10, 10, 46, 0.8); color: #4fc3f7; }',
                skin: "oxide-dark",
                content_css: "dark",
              }}
            />

            <div className="file-upload cyber-box">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*"
                style={{ display: "none" }}
              />
              <button
                className="cyber-button upload-button"
                onClick={() => fileInputRef.current.click()}
              >
                <span className="button-text">Attach Files</span>
                <span className="button-glow"></span>
              </button>
              <div className="file-list">
                {files.map((file, index) => (
                  <div key={index} className="file-item cyber-box">
                    <span>{file.name}</span>
                    <button
                      className="cyber-button-small"
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {errors.length > 0 && (
              <div className="error-messages cyber-alert">
                {errors.map((error, index) => (
                  <p key={index} className="error">
                    {error}
                  </p>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="cyber-button preview-button"
                onClick={() => setIsPreview(true)}
              >
                <span className="button-text">Preview</span>
                <span className="button-glow"></span>
              </button>
              <button className="cyber-button cancel-button" onClick={onClose}>
                <span className="button-text">Cancel</span>
                <span className="button-glow"></span>
              </button>
              <button
                className="cyber-button submit-button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <span className="button-text">
                  {isSubmitting ? "Posting..." : "Post"}
                </span>
                <span className="button-glow"></span>
              </button>
            </div>
          </div>
        ) : (
          <div className="preview-content cyber-box">
            <h3 className="neon-text">{postTitle}</h3>
            <div className="category-tag cyber-tag">{selectedCategory}</div>
            <div
              className="post-content holographic-text"
              dangerouslySetInnerHTML={{ __html: postContent }}
            />
            <div className="preview-actions">
              <button
                className="cyber-button"
                onClick={() => setIsPreview(false)}
              >
                <span className="button-text">Edit</span>
                <span className="button-glow"></span>
              </button>
              <button
                className="cyber-button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <span className="button-text">
                  {isSubmitting ? "Posting..." : "Publish"}
                </span>
                <span className="button-glow"></span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewPost;
