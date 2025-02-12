import React, { useEffect, useState } from "react";
import NewPost from "../Posts/NewPost";

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/posts/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const toggleCreatePost = () => {
    setIsCreatingPost((prev) => !prev);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="posts-page">
      <h1>Posts</h1>
      <button onClick={toggleCreatePost}>
        {isCreatingPost ? "Cancel New Post" : "Create New Post"}
      </button>

      {isCreatingPost && <NewPost onClose={toggleCreatePost} />}

      <div className="posts-list">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.post_id} className="post-item">
              <h3>{post.username}</h3>
              <p>{post.content}</p>
              <small>{new Date(post.created_at).toLocaleString()}</small>
            </div>
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>
    </div>
  );
};

export default PostsPage;
