import { useState } from "react";

const NewPost = ({ onPostCreated }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token"); // Get stored token

        if (!token) {
            alert("You must be logged in to post.");
            return;
        }

        const response = await fetch("http://localhost:8000/api/posts/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content }),
        });
        
        if (response.ok) {
            setTitle("");
            setContent("");
            onPostCreated(); // Refresh post list
        } else {
            console.error("Failed to create post");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <textarea
                placeholder="Write something..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
            />
            <button type="submit">Post</button>
        </form>
    );
};

export default NewPost;
