import React, { useState } from "react";
import NewPost from "../Posts/NewPost";

const PostsPage = () => {
  const [isModalOpen, setModalOpen] = useState(true); // Open modal by default

  const closeNewPost = () => {
    setModalOpen(false); // Allow closing the modal
  };

  return (
    <div>
      <h1>Posts</h1>
      <NewPost isOpen={isModalOpen} onClose={closeNewPost} />
    </div>
  );
};

export default PostsPage;
