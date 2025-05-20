import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaCog,
  FaEdit,
  FaGithub,
  FaExternalLinkAlt,
  FaCheck,
  FaCopy,
} from "react-icons/fa";
import { motion } from "framer-motion";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import PostCard from '../Posts/PostCard';
import "./ProfileView.css";
import { useUser } from '../Accounts/UserContext';
import { useProfile } from './ProfileContext';

import placeholder from "../images/placeholder.png";

// Project Card Component
const ProjectCard = ({ project }) => (
  <motion.div
    className="project-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0, 0, 0, 0.12)" }}
    transition={{ duration: 0.3 }}
  >
    <img 
      src={project.image || placeholder} 
      alt={project.title} 
      className="project-image"
    />
    <div className="project-overlay">
      <div className="project-links">
        {project.github && (
          <motion.a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaGithub />
          </motion.a>
        )}
        {project.liveUrl && (
          <motion.a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaExternalLinkAlt />
          </motion.a>
        )}
      </div>
    </div>
    <div className="project-content">
      <h3 className="project-title">{project.title}</h3>
      <p className="project-description">{project.description}</p>
      <div className="project-tags">
        {project.tags?.map((tag, index) => (
          <motion.span 
            key={index} 
            className="project-tag"
            whileHover={{ scale: 1.05 }}
          >
            {tag}
          </motion.span>
        ))}
      </div>
    </div>
  </motion.div>
);

// Experience Item Component
const ExperienceItem = ({ experience }) => (
  <motion.div 
    className="experience-item"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ x: 10 }}
    transition={{ duration: 0.3 }}
  >
    <div className="experience-logo">
      <img src={experience.companyLogo || placeholder} alt={experience.company} />
    </div>
    <div className="experience-content">
      <h4 className="experience-company">{experience.company}</h4>
      <p className="experience-position">{experience.position}</p>
      <p className="experience-duration">{experience.duration}</p>
      <p className="experience-description">{experience.description}</p>
    </div>
  </motion.div>
);

// Skill Item Component
const SkillItem = ({ skill }) => (
  <motion.div 
    className="skill-item"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
  >
    <div className="skill-header">
      <h4 className="skill-name">{skill.name}</h4>
      <span className="skill-level">{skill.level}%</span>
    </div>
    <div className="skill-bar">
      <motion.div 
        className="skill-progress" 
        initial={{ width: 0 }}
        animate={{ width: `${skill.level}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        title={`${skill.level}% proficiency`}
      />
    </div>
  </motion.div>
);

const ProfileView = () => {
  const userContext = useUser();
  const profileContext = useProfile();
  
  const setUser = useMemo(() => userContext?.setUser || (() => {}), [userContext?.setUser]);
  const user = useMemo(() => userContext?.user || {}, [userContext?.user]);
  const profile = useMemo(() => profileContext?.profile || {}, [profileContext?.profile]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    projects: 0,
  });
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();
  const { userId } = useParams();

  const handleCopyUsername = useCallback(() => {
    try {
      const profileLink = `https://eduverse.in/user/${user.username}`;
      navigator.clipboard.writeText(profileLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy username to clipboard");
    }
  }, [user.username]);

  const handleEditProfile = useCallback(() => {
    navigate('/profile/edit');
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("No access token found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `https://edu-verse.in/api/profiles/me/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        if (!response.data) {
          throw new Error("No data received from server");
        }

        setUser(response.data);
        setStats({
          followers: response.data.followers_count || 0,
          following: response.data.following_count || 0,
          projects: response.data.projects?.length || 0,
        });
        setLoading(false);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Fetch cancelled");
        } else if (err.response?.status === 401) {
          setError("Unauthorized. Please log in again.");
          localStorage.removeItem("access_token");
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Failed to fetch user data");
        }
        setLoading(false);
      }
    };

    fetchUserData();
    return () => controller.abort();
  }, [setUser, navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return <ErrorMessage message="No user data available." />;

  return (
    <motion.div 
      className="profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-view-container">
        {/* Left Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-header-container">
            <motion.img
              className="profile-avatar"
              src={user.avatarUrl || placeholder}
              alt={user.name || "Profile"}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
            <div className="profile-content">
              <h1 className="profile-name">{user.name || user.username}</h1>
              <p 
                className={`profile-username ${copied ? 'copied' : ''}`}
                onClick={handleCopyUsername}
                title="Click to copy profile link"
              >
                @{user.username}
                {copied ? <FaCheck className="copy-icon" /> : <FaCopy className="copy-icon" />}
              </p>
              
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{stats.followers}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.following}</span>
                  <span className="stat-label">Following</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.projects}</span>
                  <span className="stat-label">Projects</span>
                </div>
              </div>

              <div className="profile-actions">
                <motion.button 
                  className="action-btn edit-btn" 
                  onClick={handleEditProfile}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaEdit />
                  <span>Edit Profile</span>
                </motion.button>
                <motion.button 
                  className="action-btn settings-btn" 
                  onClick={() => navigate('/settings')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaCog />
                  <span>Settings</span>
                </motion.button>
              </div>

              <p className="profile-bio">{user.bio || "No bio provided"}</p>

              {/* Skills Section in Sidebar */}
              <section className="skills-section">
                <h3>Skills</h3>
                <div className="skills-grid">
                  {user.skills?.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <SkillItem 
                        key={index} 
                        skill={{ 
                          name: skill.name || skill, 
                          level: skill.level || Math.floor(Math.random() * 30) + 70 
                        }} 
                      />
                    ))
                  ) : (
                    <p>No skills listed</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="profile-content-area">
          {/* Posts Section */}
          <section className="section">
            <div className="section-header">
              <h2>Posts</h2>
            </div>
            {user.posts?.length > 0 ? (
              <div className="posts-grid">
                {user.posts.map((post, idx) => (
                  <PostCard key={idx} post={post} />
                ))}
              </div>
            ) : (
              <div className="empty-card">
                <p>No posts yet.<br />
                  <Link to="/new-post" className="cta-link">Start Posting</Link>
                </p>
              </div>
            )}
          </section>

          {/* Experience Section */}
          <section className="section">
            <div className="section-header">
              <h2>Experience</h2>
              <span className="section-meta">
                {user.experience?.length > 0 ? `${user.experience.length} positions` : 'No experience yet'}
              </span>
            </div>
            <div className="experience-timeline">
              {user.experience?.length > 0 ? (
                user.experience.map((exp, index) => (
                  <ExperienceItem key={index} experience={exp} />
                ))
              ) : (
                <div className="empty-card">
                  <p>No experience information provided</p>
                </div>
              )}
            </div>
          </section>

          {/* Projects Section */}
          <section className="section">
            <div className="section-header">
              <h2>Projects</h2>
              <span className="section-meta">
                {user.projects?.length > 0 ? `${user.projects.length} projects` : 'No projects yet'}
              </span>
            </div>
            <div className="projects-grid">
              {user.projects?.length > 0 ? (
                user.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="empty-card">
                  <p>No projects yet</p>
                </div>
              )}
            </div>
          </section>

          {/* Education Section */}
          <section className="section">
            <div className="section-header">
              <h2>Education</h2>
              <span className="section-meta">
                {user.education?.length > 0 ? `${user.education.length} institutions` : 'No education yet'}
              </span>
            </div>
            {user.education?.length > 0 ? (
              user.education.map((edu, index) => (
                <div key={index} className="profile-section-card education-item">
                  <h4>{edu.school}</h4>
                  <p>{edu.degree}</p>
                  <p>{edu.year}</p>
                </div>
              ))
            ) : (
              <div className="empty-card">
                <p>No education information provided</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileView;
