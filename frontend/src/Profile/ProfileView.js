import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheck, FaCopy, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import "./ProfileView.css";


import { useProfile } from './ProfileContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import PostCard from '../Posts/PostCard';
import PostModal from '../Posts/PostModal';
import NewPost from '../Posts/NewPost';
import placeholder from '../images/placeholder.png';
import SkillItem from './SkillItem';
import ExperienceItem from './ExperienceItem';
import ProjectCard from './ProjectCard';

const ProfileView = () => {
  const { profile, isLoading, error, fetchProfile, updateProfile } = useProfile();
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [copied, setCopied] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const navigate = useNavigate();

  const handleCopyUsername = useCallback(() => {
    try {
      const profileLink = `${window.location.origin}/user/${profile.username}`;
      navigator.clipboard.writeText(profileLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy profile link");
    }
  }, [profile?.username]);

  const handlePostCreated = useCallback(() => {
    setShowNewPostModal(false);
    fetchProfile(); // Refresh after new post
  }, [fetchProfile]);

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  const handleFollowToggle = async () => {
    if (followLoading) return;

    try {
      setFollowLoading(true);
      const token = localStorage.getItem('access_token');
      const endpoint = profile.is_following ? 'unfollow' : 'follow';

      const response = await axios.post(
        `/api/profiles/${profile.id}/${endpoint}/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      updateProfile({
        ...profile,
        is_following: !profile.is_following,
        followers_count: profile.followers_count + (profile.is_following ? -1 : 1)
      });

      toast.success(profile.is_following ? 'Unfollowed user' : 'Followed user');
    } catch (err) {
      toast.error(`Failed to ${profile.is_following ? 'unfollow' : 'follow'} user`);
    } finally {
      setFollowLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!profile) return <ErrorMessage message="No profile data available." />;

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-view-container">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-header-container">
            <motion.img
              className="profile-avatar"
              src={profile.profile_image || profile.avatar_url || placeholder}
              alt={profile.display_name}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
            <div className="profile-content">
              <h1 className="profile-name">{profile.display_name || profile.username}</h1>
              <p className={`profile-username ${copied ? 'copied' : ''}`} onClick={handleCopyUsername}>
                @{profile.username}
                {copied ? <FaCheck className="copy-icon" /> : <FaCopy className="copy-icon" />}
              </p>

              <div className="profile-stats">
                <div className="stat-item" onClick={() => setActiveTab('followers')}>
                  <span className="stat-value">{profile.followers_count}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat-item" onClick={() => setActiveTab('following')}>
                  <span className="stat-value">{profile.following_count}</span>
                  <span className="stat-label">Following</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{profile.posts_count || 0}</span>
                  <span className="stat-label">Posts</span>
                </div>
              </div>

              <div className="profile-actions">
                <button className="action-btn edit-btn" onClick={() => navigate('/profile/edit')}>
                  Edit Profile
                </button>
                <button className="action-btn settings-btn" onClick={() => navigate('/settings')}>
                  Settings
                </button>
              </div>

              <p className="profile-bio">{profile.bio || "No bio provided"}</p>

              <section className="skills-section">
                <h3>Skills</h3>
                <div className="skills-grid">
                  {profile.skills && Object.keys(profile.skills).length > 0 ? (
                    Object.entries(profile?.skills)?.map(([name, level], idx) => (
                      <SkillItem key={idx} skill={{ name, level }} />
                    ))
                  ) : (
                    <p>No skills listed</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main-content glass-panel">
          <div className="profile-sections">
            {/* Posts */}
            <section className="section glass-panel">
              <div className="section-header">
                <h2>Posts</h2>
                <button 
                  className="new-post-btn"
                  onClick={() => setShowNewPostModal(true)}
                >
                  <span>+ New Post</span>
                </button>
              </div>
              {profile.posts?.length > 0 ? (
                <div className="posts-grid">
                  {profile.posts.map((post, idx) => (
                    <PostCard 
                      key={post.id || idx} 
                      post={post} 
                      isGrid={true}
                      onClick={() => handlePostClick(post)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-card">
                  <p>No posts yet.<br />
                    <button
                      onClick={() => setShowNewPostModal(true)}
                      className="cta-link"
                    >
                      Start Posting
                    </button>
                  </p>
                </div>
              )}
            </section>

            {/* Experience */}
            <section className="section glass-panel">
              <div className="section-header">
                <h2>Experience</h2>
              </div>
              <div className="experience-timeline">
                {profile.experiences?.length > 0 ? (
                  profile.experiences.map((exp, idx) => (
                    <ExperienceItem key={idx} experience={exp} />
                  ))
                ) : (
                  <div className="empty-card">
                    <p>No experience listed</p>
                  </div>
                )}
              </div>
            </section>

            {/* Projects */}
            <section className="section glass-panel">
              <div className="section-header">
                <h2>Projects</h2>
              </div>
              {profile.projects?.length > 0 ? (
                <div className="projects-grid">
                  {profile.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="empty-card">
                  <p>No projects listed</p>
                </div>
              )}
            </section>

            {/* Education */}
            <section className="section glass-panel">
              <div className="section-header">
                <h2>Education</h2>
              </div>
              {profile.education_details?.length > 0 ? (
                profile.education_details.map((edu, idx) => (
                  <div key={idx} className="profile-section-card education-item">
                    <h4>{edu.school}</h4>
                    <p>{edu.degree}</p>
                    <p>{edu.year}</p>
                  </div>
                ))
              ) : (
                <div className="empty-card">
                  <p>No education details provided</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowNewPostModal(false)}>
              <FaTimes />
            </button>
            <NewPost onPostCreated={handlePostCreated} />
          </div>
        </div>
      )}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={handleCloseModal}
        />
      )}
    </motion.div>
  );
};

export default ProfileView;
