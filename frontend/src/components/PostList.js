import { useEffect, useState } from "react";

const PostList = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/api/posts/")
            .then((res) => res.json())
            .then((data) => setPosts(data))
            .catch((error) => console.error("Error fetching posts:", error));
    }, []);

    return (
        <div>
            <h2>Latest Posts</h2>
            {posts.map((post) => (
                <div key={post.id} className="post-card">
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    <small>By {post.author_name} | {new Date(post.created_at).toLocaleString()}</small>
                </div>
            ))}
        </div>
    );
};

export default PostList;
