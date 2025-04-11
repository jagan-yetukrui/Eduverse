import { useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "../Posts/NewPost.css"; 


const NewPost = ({ onPostCreated }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [files, setFiles] = useState([]);
    const [isPreview, setIsPreview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState([]);
    const fileInputRef = useRef(null);

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
        if (!title.trim()) newErrors.push("Title is required");
        if (!content.trim()) newErrors.push("Post content is required");
        if (!selectedCategory) newErrors.push("Please select a category");

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePost() || isSubmitting) return;
    
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication required");
    
            const response = await fetch("http://127.0.0.1:8000/api/posts/", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    post_type: selectedCategory
                }),
            });
    
            if (response.ok) {
                setTitle("");
                setContent("");
                setSelectedCategory("");
                onPostCreated();  // ✅ Update post list in frontend
                alert("Post created successfully!");
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to create post");
            }
        } catch (err) {
            setErrors([err.message]);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="new-post-container">
           
            <h2 style={{ color: "#213555" }}>{isPreview ? "Preview Post" : "Create New Post"}</h2>

            {!isPreview ? (
                <form onSubmit={handleSubmit} className="post-form">
                    <div className="input-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter post title..."
                            className="title-input"
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="category-select"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Post Content</label>
                        <Editor
                            apiKey="vzy136fy9hej20t0rxfpxu19mooxienl5owvp1v3af6w09di"
                            value={content}
                            onEditorChange={(newContent) => setContent(newContent)}
                            init={{
                                height: 500,  
                                max_height: 700,
                                autoresize_bottom_margin: 20,
                                menubar: false,
                                plugins: ["lists", "link", "autoresize"],
                                toolbar: "undo redo | bold italic underline | bullist numlist | link",
                                content_style: `
                                    body { 
                                        font-family: 'Inter', sans-serif; 
                                        font-size:14px; 
                                        background: rgba(255,255,255,0.9); 
                                        color: #4a5568; 
                                        padding: 10px;
                                        min-height: 500px;  
                                    }
                                `,
                                skin: "oxide-dark",
                                content_css: "dark",
                            }}
                        />
                    </div>

                    <div className="file-upload">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            multiple
                            accept="image/*"
                            style={{ display: "none" }}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                        >
                            Attach Files
                        </button>
                        <div className="file-list">
                            {files.map((file, index) => (
                                <div key={index} className="file-item">
                                    <span>{file.name}</span>
                                    <button type="button" onClick={() => removeFile(index)}>
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {errors.length > 0 && (
                        <div className="error-messages">
                            {errors.map((error, index) => (
                                <p key={index} className="error">{error}</p>
                            ))}
                        </div>
                    )}

                    <div className="modal-actions d-flex justify-content-between">
                        
                        <button className='button-post' type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Posting..." : "Post"}
                        </button>

                    </div>
                    
                </form>
            ) : (
                <div className="preview-content">
                    <h3>{title}</h3>
                    <div className="category-tag">{selectedCategory}</div>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                    <button onClick={() => setIsPreview(false)}>Edit</button>
                    <button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Posting..." : "Publish"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default NewPost;

