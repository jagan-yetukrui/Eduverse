import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar/Navbar'; // Navbar always present
import Home from './Home/Home';
import Login from './enter/login/Login';  
import Register from './enter/registration/Register'; 
import ProfileView from './Profile/ProfileView'; // Profile View component
import Profile from './Profile/Profile'; // Profile Edit component (keep the original name)
import Messages from './Messages/Messages'; 
import Notes from './Notes/Notes'; 
import NewPost from './Posts/NewPost'; 
import Search from './Navbar/Search'; 

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navbar should always be present */}
        <Navbar />
        
        {/* Define all routes */}
        <Routes>
          <Route path="/" element={<Home />} /> {/* Home Page */}
          <Route path="/login" element={<Login />} /> {/* Login Page */}
          <Route path="/register" element={<Register />} /> {/* Register Page */}
          <Route path="/profile" element={<ProfileView />} /> {/* Profile View Page */}
          <Route path="/profile/edit" element={<Profile />} /> {/* Profile Edit Page, using Profile.js */}
          <Route path="/messages" element={<Messages />} /> {/* Messages Page */}
          <Route path="/notes" element={<Notes />} /> {/* Notes Page */}
          <Route path="/newpost" element={<NewPost />} /> {/* New Post Page */}
          <Route path="/search" element={<Search />} /> {/* Search Page */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
