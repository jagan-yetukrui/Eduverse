import React, { useEffect, useState } from "react";
import axios from "axios";

import "./PostList.css";

function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('access_token');
        console.log(token);
        
        if (!token) {
          console.error("No token found. Please log in.");
          // window.location.href = "/login";
          return;
        }

        // Make the API request with the Authorization header
        const response = await axios.get("http://127.0.0.1:8000/api/posts/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Set the posts state with the response data
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

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
          <div className="container" key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <small>
              Posted on {new Date(post.created_at).toLocaleDateString()}
            </small>
          </div>
        ))}
    </div>
  );
}

export default PostList;
