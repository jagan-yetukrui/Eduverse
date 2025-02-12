import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
//import NewPost from "./NewPost";
import "./NewPost.css";

const NewPost = ({ isOpen, onClose, embedded = false  }) => {
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

  if (!isOpen && !embedded) return null;

  return (
    <div className={embedded ? "embedded-new-post" : "modal-overlay"}>
      <div className={embedded ? "" : "holographic-panel modal-content"}>
        <div className="modal-header">
          <h2 className="neon-text">{embedded ? "New Post" : "Create New Post"}</h2>
          {!embedded && (
            <button className="close-button cyber-button" onClick={onClose}>
              &times;
            </button>
          )}
        </div>
        <div className="modal-body">
          {/* Rest of your NewPost content */}
        </div>
      </div>
    </div>
  );
};


export default NewPost;
