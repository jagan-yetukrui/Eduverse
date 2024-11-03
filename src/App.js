import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar/Navbar'; // Navbar always present
import Home from './Home/Home';
import Login from './enter/login/Login';  
import Register from './enter/registration/Register'; 
import ProfileView from './Profile/ProfileView'; // Profile View component
import Profile from './EditProfile/EditProfile'; // Profile Edit component (keep the original name)
import Messages from './Messages/Messages'; 
import Notes from './Notes/Notes'; 
import NewPost from './Posts/NewPost'; 
import Search from './Navbar/Search'; 
import Settings from './Settings/Settings';  // Import the Settings component

// Import subpages from the Settings directory
import ProfilePrivacy from './Settings/ProfilePrivacy'; 
import Notifications from './Settings/Notifications'; 
import Blocked from './Settings/Blocked'; 
import Help from './Settings/Help'; 
import AccountSettings from './Settings/AccountSettings'; 

// Import additional sections for profile editing
import Experience from './EditProfile/Experience';
import Education from './EditProfile/Education';
import Skills from './EditProfile/Skills';
import Projects from './EditProfile/Projects';
import Licenses from './EditProfile/Licenses';

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
          <Route path="/profile/edit" element={<Profile />}> {/* Profile Edit Page with nested routes */}
            <Route path="experience" element={<Experience />} /> {/* Edit Experience */}
            <Route path="education" element={<Education />} /> {/* Edit Education */}
            <Route path="skills" element={<Skills />} /> {/* Edit Skills */}
            <Route path="Licenses" element={<Licenses />} /> {/* Edit Certifications */}
            <Route path="projects" element={<Projects />} /> {/* Edit Projects */}
          </Route>
          <Route path="/messages" element={<Messages />} /> {/* Messages Page */}
          <Route path="/notes" element={<Notes />} /> {/* Notes Page */}
          <Route path="/newpost" element={<NewPost />} /> {/* New Post Page */}
          <Route path="/search" element={<Search />} /> {/* Search Page */}
          
          {/* Settings Routes with subpages */}
          <Route path="/settings" element={<Settings />}>
            <Route path="profile-privacy" element={<ProfilePrivacy />} /> {/* Profile Privacy Page */}
            <Route path="notifications" element={<Notifications />} /> {/* Notifications Page */}
            <Route path="account-security" element={<AccountSettings />} /> {/* Account Security Page */}
            <Route path="blocked" element={<Blocked />} /> {/* Blocked Users Page */}
            <Route path="help" element={<Help />} /> {/* Help & Support Page */}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
