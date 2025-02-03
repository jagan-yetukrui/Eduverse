import { useState } from "react";
import NewPost from "./components/NewPost";
import PostList from "./components/PostList";

const App = () => {
    const [refresh, setRefresh] = useState(false);

    return (
        <div>
            <h1>EduVerse</h1>
            <NewPost onPostCreated={() => setRefresh(!refresh)} />
            <PostList key={refresh} />
        </div>
    );
};

export default App;
