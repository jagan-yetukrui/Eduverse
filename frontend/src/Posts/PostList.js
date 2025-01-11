import React, { useEffect, useState } from "react";
import axios from "axios";

import "./PostList.css";

function PostList() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/posts/");
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("Failed to fetch posts. Please try again later.");
      }
    };
    fetchPosts();
  }, []);

  if (error) {
    return <p className="error-message">{error}</p>; // Render error message
  }

  return (
    <div className="post-list">
      {posts.length === 0 ? (
        <p>No posts available yet. Be the first to create one!</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="post-item">
            <h3>{post.post_type}</h3>
            <p>{post.content}</p>
            <small>
              Posted on {new Date(post.created_at).toLocaleDateString()}
            </small>
          </div>
        ))
      )}
    </div>
  );
}

export default PostList;
