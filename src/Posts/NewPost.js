import { useState, useRef, useEffect, useCallback } from "react";
import * as LR from "@uploadcare/blocks";
import blocksStyles from "@uploadcare/blocks/web/lr-file-uploader-regular.min.css?url";
import './NewPost.css';  // For additional styling

LR.registerBlocks(LR);

const NewPost = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const ctxProviderRef = useRef(null);

  // Categories for the posts
  const categories = ['Project', 'Research', 'Job', 'Service', 'General Post', 'Other'];

  // Handle category selection
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleRemoveClick = useCallback(
    (uuid) => setUploadedFiles((prevFiles) => prevFiles.filter((f) => f.uuid !== uuid)),
    []
  );

  // Track file upload events and set uploaded files
  useEffect(() => {
    const handleUploadEvent = (e) => {
      if (e.detail) {
        console.log("Uploaded files: ", e);
        setUploadedFiles([...e.detail]);
      }
    };
    ctxProviderRef.current?.addEventListener("data-output", handleUploadEvent);

    return () => {
      ctxProviderRef.current?.removeEventListener("data-output", handleUploadEvent);
    };
  }, []);

  const handlePostSubmit = () => {
    const postData = {
      title: postTitle,
      description: postDescription,
      category: selectedCategory,
      images: uploadedFiles.map(file => file.cdnUrl),
    };
    console.log('Post Data:', postData);
    // Send postData to backend API here for saving the post
  };

  return (
    <div className="new-post-container">
      <h2>Create New Post</h2>

      {/* Post Title Input */}
      <div className="input-group">
        <label>Post Title</label>
        <input
          type="text"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          placeholder="Enter post title"
          required
        />
      </div>

      {/* Post Description Input */}
      <div className="input-group">
        <label>Post Description</label>
        <textarea
          value={postDescription}
          onChange={(e) => setPostDescription(e.target.value)}
          placeholder="Write a brief description..."
          required
        />
      </div>

      {/* Category Selector */}
      <div className="input-group">
        <label>Select Category</label>
        <select value={selectedCategory} onChange={handleCategoryChange} required>
          <option value="">Select a Category</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* File Uploader */}
      <lr-config
        ctx-name="my-uploader"
        pubkey="74e63f3a7042561655f6"
        multiple={true}
        confirmUpload={false}
        removeCopyright={true}
        imgOnly={true}
      ></lr-config>

      <lr-file-uploader-regular
        ctx-name="my-uploader"
        css-src={blocksStyles}
      ></lr-file-uploader-regular>

      <lr-upload-ctx-provider ctx-name="my-uploader" ref={ctxProviderRef} />

      {/* Display Uploaded Files */}
      <div className="uploaded-files">
        {uploadedFiles.map((file) => (
          <div key={file.uuid} className="uploaded-file">
            <img
              src={`${file.cdnUrl}/-/format/webp/-/quality/smart/-/stretch/fill/`}
              alt="Uploaded"
            />
            <button type="button" onClick={() => handleRemoveClick(file.uuid)}>
              × Remove
            </button>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button onClick={handlePostSubmit} className="submit-post-button">
        Submit Post
      </button>
    </div>
  );
};

export default NewPost;
