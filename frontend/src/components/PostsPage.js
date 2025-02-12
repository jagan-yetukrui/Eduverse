import React, { useState } from "react";
import NewPost from "../Posts/NewPost";

const PostsPage = () => {
  const [showNewPostForm, setShowNewPostForm] = useState(false); // Toggle the form

  const toggleNewPostForm = () => {
    setShowNewPostForm((prev) => !prev);
  };

  return (
    <div className="posts-page">
      <h1>Posts</h1>
      {/* New Post Button */}
      <button className="cyber-button" onClick={toggleNewPostForm}>
        {showNewPostForm ? "Close New Post" : "Create New Post"}
      </button>

      {/* Show the NewPost form when toggled */}
      {showNewPostForm && <NewPost isOpen={true} onClose={toggleNewPostForm} />}
    </div>
  );
};

export default PostsPage;
