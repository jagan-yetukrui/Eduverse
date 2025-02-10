import { useEffect, useState } from "react";

const PostList = () => {
    const [posts, setPosts] = useState([]);

    /*useEffect(() => {
        fetch("http://localhost:8000/api/posts/")
            .then((res) => res.json())
            .then((data) => setPosts(data))
            .catch((error) => console.error("Error fetching posts:", error));
    }, []);*/

    const fetchMyPosts = async () => {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8000/api/posts/?my_posts=true", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Include token in headers
            },
        });

        if (response.ok) {
            const data = await response.json();
            setPosts(data); // Set posts in state
        } else {
            console.error("Failed to fetch user-specific posts");
        }
    };

    useEffect(() => {
        fetchMyPosts(); // Fetch user's posts when the component mounts
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
