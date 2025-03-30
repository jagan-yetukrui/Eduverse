import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import ErrorBoundary from './ErrorBoundary/ErrorBoundary';
import './App.css';
import { UserProvider } from './Accounts/UserContext';
import { ProfileProvider } from './Profile/ProfileContext';

// Lazy load components to improve performance
const Home = lazy(() => import('./Home/Home'));
const Login = lazy(() => import('./enter/login/Login'));
const Register = lazy(() => import('./enter/registration/Register'));
const ProfileView = lazy(() => import('./Profile/ProfileView'));
const Profile = lazy(() => import('./EditProfile/EditProfile'));
const Messages = lazy(() => import('./Messages/Messages'));
const Notes = lazy(() => import('./Notes/Notes'));
const NewPost = lazy(() => import('./Posts/NewPost'));
const PostList = lazy(() => import('./Posts/PostList'));
const Search = lazy(() => import('./Search/Searchpage'));
const Settings = lazy(() => import('./Settings/Settings'));
const TinyMCEDemo = lazy(() => import('./TinyMCEDemo'));
const ProjectSuggestions = lazy(() => import('./Notes/ProjectSuggestions'));
const CareerGuidance = lazy(() => import('./Notes/CareerGuidance'));
const ProjectDetails = lazy(() => import('./Notes/ProjectsData')); // Fixed import path and component name
const Steps = lazy(() => import('./Notes/Steps'));

// Settings subpages
const ProfilePrivacy = lazy(() => import('./Settings/ProfilePrivacy'));
const Notifications = lazy(() => import('./Settings/Notifications')); 
const Blocked = lazy(() => import('./Settings/Blocked'));
const Help = lazy(() => import('./Settings/Help'));
const AccountSettings = lazy(() => import('./Settings/AccountSettings'));

// Profile editing subpages
const Experience = lazy(() => import('./EditProfile/Experience'));
const Education = lazy(() => import('./EditProfile/Education'));
const Skills = lazy(() => import('./EditProfile/Skills'));
const Projects = lazy(() => import('./EditProfile/Projects'));
const Licenses = lazy(() => import('./EditProfile/Licenses'));

// 404 Not Found page
const NotFound = lazy(() => import('./NotFound'));

function App() {
  useEffect(() => {
    document.title = "EduVerse"; // Set a default title for the app
  }, []);

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <Router>
          <div className="App">
            <Navbar />
            <ErrorBoundary>
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<ProfileView />} />
                  <Route path="/profile/edit" element={<Profile />}>
                    <Route path="experience" element={<Experience />} />
                    <Route path="education" element={<Education />} />
                    <Route path="skills" element={<Skills />} />
                    <Route path="licenses" element={<Licenses />} />
                    <Route path="projects" element={<Projects />} />
                  </Route>
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/project-suggestions" element={<ProjectSuggestions />} />
                  <Route path="/career-guidance" element={<CareerGuidance />} />
                  <Route path="/projects/:projectId" element={<ProjectDetails />} />
                  <Route path="/projects/:projectId/steps" element={<Steps />} />
                  <Route path="/posts" element={<PostList />} />
                  <Route path="/newpost" element={<NewPost />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/settings" element={<Settings />}>
                    <Route path="profile-privacy" element={<ProfilePrivacy />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="account-security" element={<AccountSettings />} />
                    <Route path="blocked" element={<Blocked />} />
                    <Route path="help" element={<Help />} />
                  </Route>
                  <Route
                    path="/tinymce-demo"
                    element={
                      <ErrorBoundary>
                        <TinyMCEDemo />
                      </ErrorBoundary>
                    }
                  />
                  {/* Fallback for unmatched routes */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>
        </Router>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

export default App;
