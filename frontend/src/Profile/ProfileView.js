import axios from "axios";
import { format, isValid } from "date-fns";
import React, { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaCog,
  FaEdit,
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaShare,
  FaUserPlus,
  FaUserMinus,
  FaBan,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import "./ProfileView.css";
import { useUser } from '../Accounts/UserContext';
import { useProfile } from './ProfileContext';

import placeholder from "../images/placeholder.png";

// Profile Header Component
const ProfileHeader = ({
  user,
  stats,
  isEditing,
  handleEditChange,
  handleSaveEdit,
}) => (
  <div className="profile-header-container">
    {isEditing ? (
      <div className="edit-profile-form">
        <input
          type="text"
          name="name"
          value={user.name}
          onChange={handleEditChange}
          placeholder="Name"
        />
        <input
          type="text"
          name="username"
          value={user.username}
          onChange={handleEditChange}
          placeholder="Username"
        />
        <textarea
          name="bio"
          value={user.bio}
          onChange={handleEditChange}
          placeholder="Bio"
        />
        <button onClick={handleSaveEdit}>Save Changes</button>
      </div>
    ) : (
      <>
        <div className="profile-stats">
          <img
            className="profile-avatar"
            // src={user.avatarUrl || "/default-avatar.jpg"}
            src={placeholder}
            alt={placeholder}
          />
          <div style={{ display: "flex", gap: "1rem" }}>
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="stat-item">
                <span className="stat-value">{value}</span>
                <span className="stat-label">{key}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-content">
          <h1 className="profile-name">{user.username}</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p className="profile-username">@ {user.username}</p>
            <p className="profile-join-date">
              Joined
              {user.joinedDate && isValid(new Date(user.joinedDate))
                ? format(new Date(user.joinedDate), "MMMM yyyy")
                : " Unknown"}
            </p>
            <p className="profile-bio">{user.bio || "No bio provided"}</p>
          </div>
        </div>
      </>
    )}
  </div>
);

// Profile Actions Component
const ProfileActions = ({
  isOwnProfile,
  handleEdit,
  handleSettings,
  handleFollowToggle,
  handleMessage,
  handleShare,
  isFollowing,
  isBlocked,
}) => (
  <div className="profile-actions">
    {isOwnProfile ? (
      <>
        <button className="action-btn edit-btn" onClick={handleEdit}>
          <FaEdit /> Edit Profile
        </button>
        <button className="action-btn settings-btn" onClick={handleSettings}>
          <FaCog /> Settings
        </button>
      </>
    ) : (
      <>
        <button
          className={`follow-btn ${isFollowing ? "following" : ""} ${isBlocked ? "blocked" : ""}`}
          onClick={handleFollowToggle}
          disabled={isBlocked}
        >
          {isFollowing ? <><FaUserMinus /> Unfollow</> : <><FaUserPlus /> Follow</>}
        </button>
        <button
          className={`block-btn ${isBlocked ? "blocked" : ""}`}
          onClick={handleFollowToggle}
        >
          <FaBan /> {isBlocked ? "Unblock" : "Block"}
        </button>
        <button className="message-btn" onClick={handleMessage}>
          Message
        </button>
      </>
    )}
    <button className="action-btn share-btn" onClick={handleShare}>
      <FaShare /> Share
    </button>
  </div>
);

// Profile Details Component with Edit Mode
const ProfileDetails = ({
  user,
  isEditing,
  handleEditChange,
  handleSaveEdit,
}) => (
  <div className="profile-details-container">
    <section className="education-section">
      <h3>Education</h3>
      {isEditing ? (
        <div className="edit-education">
          {user.education?.map((edu, index) => (
            <div key={index} className="edit-education-item">
              <input
                type="text"
                name={`education[${index}].school`}
                value={edu.school}
                onChange={handleEditChange}
                placeholder="School"
              />
              <input
                type="text"
                name={`education[${index}].degree`}
                value={edu.degree}
                onChange={handleEditChange}
                placeholder="Degree"
              />
              <input
                type="text"
                name={`education[${index}].year`}
                value={edu.year}
                onChange={handleEditChange}
                placeholder="Year"
              />
            </div>
          ))}
          <button onClick={() => handleEditChange({ type: "ADD_EDUCATION" })}>
            Add Education
          </button>
        </div>
      ) : user.education?.length > 0 ? (
        user.education.map((edu, index) => (
          <div key={index} className="education-item">
            <h4>{edu.school}</h4>
            <p>{edu.degree}</p>
            <p>{edu.year}</p>
          </div>
        ))
      ) : (
        <p className="empty-section">No education information provided</p>
      )}
    </section>

    <section className="experience-section">
      <h3>Experience</h3>
      {isEditing ? (
        <div className="edit-experience">
          {user.experience?.map((exp, index) => (
            <div key={index} className="edit-experience-item">
              <input
                type="text"
                name={`experience[${index}].company`}
                value={exp.company}
                onChange={handleEditChange}
                placeholder="Company"
              />
              <input
                type="text"
                name={`experience[${index}].position`}
                value={exp.position}
                onChange={handleEditChange}
                placeholder="Position"
              />
              <input
                type="text"
                name={`experience[${index}].duration`}
                value={exp.duration}
                onChange={handleEditChange}
                placeholder="Duration"
              />
            </div>
          ))}
          <button onClick={() => handleEditChange({ type: "ADD_EXPERIENCE" })}>
            Add Experience
          </button>
        </div>
      ) : user.experience?.length > 0 ? (
        user.experience.map((exp, index) => (
          <div key={index} className="experience-item">
            <h4>{exp.company}</h4>
            <p>{exp.position}</p>
            <p>{exp.duration}</p>
          </div>
        ))
      ) : (
        <p className="empty-section">No experience information provided</p>
      )}
    </section>

    <section className="skills-section">
      <h3>Skills</h3>
      {isEditing ? (
        <div className="edit-skills">
          <input
            type="text"
            name="newSkill"
            placeholder="Add new skill"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleEditChange({
                  type: "ADD_SKILL",
                  payload: e.target.value,
                });
                e.target.value = "";
              }
            }}
          />
          <div className="skills-container">
            {user.skills?.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
                <button
                  onClick={() =>
                    handleEditChange({
                      type: "REMOVE_SKILL",
                      payload: index,
                    })
                  }
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : user.skills?.length > 0 ? (
        <div className="skills-container">
          {user.skills.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="empty-section">No skills listed</p>
      )}
    </section>
  </div>
);

const ProfileView = () => {
  const { user, setUser } = useUser();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    posts: 0,
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const navigate = useNavigate();
  const { userId } = useParams();

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`/api/users/${user.id}`, user);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to save changes");
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await axios.delete(`/api/users/${userId}/unfollow`);
      } else {
        await axios.post(`/api/users/${userId}/follow`);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      setError("Failed to update follow status");
    }
  };

  const handleMessage = () => {
    navigate(`/messages/new/${userId}`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // Add toast notification here
  };

  const scrollToContent = () => {
    document.querySelector(".profile-details-container")?.scrollIntoView({
      behavior: "smooth",
    });
  };

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
          `http://127.0.0.1:8000/api/profiles/me/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );
        setUser(response.data);
        {
          console.log(response.data);
        }
        setStats({
          followers: response.data.followers_count,
          following: response.data.following_count,
          // posts: response.data.posts_count,
        });
        setIsFollowing(response.data.is_following);
        setIsBlocked(response.data.is_blocked);
        setLoading(false);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Fetch cancelled");
        } else if (err.response && err.response.status === 401) {
          setError("Unauthorized. Please log in again.");
          localStorage.removeItem("access_token"); // Clear invalid token
          window.location.href = "/login"; // Redirect to login
        } else {
          setError("Failed to fetch user data");
        }
        setLoading(false);
      }
    };

    fetchUserData();

    return () => controller.abort(); // Cleanup on unmount
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return <ErrorMessage message="No user data available." />;

  return (
    <div className="profile-page">
      <div className="profile-view-container">
        <div
          className="profile-banner"
          style={{
            backgroundImage: `url(${user.bannerUrl || "/default-banner.jpg"})`,
          }}
        >
          {/* <div className="holographic-overlay"></div> */}
        </div>

        <ProfileHeader
          user={user}
          stats={stats}
          isEditing={isEditing}
          handleEditChange={handleEditChange}
          handleSaveEdit={handleSaveEdit}
        />

        <div className="profile-social-links">
          {user.email && (
            <a href={`mailto:${user.email}`} aria-label="Email">
              <FaEnvelope className="social-icon" />
            </a>
          )}
          {user.linkedin && (
            <a
              href={user.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedin className="social-icon" />
            </a>
          )}
          {user.github && (
            <a
              href={user.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FaGithub className="social-icon" />
            </a>
          )}
        </div>

        <ProfileActions
          isOwnProfile={!userId}
          handleEdit={() => setIsEditing(!isEditing)}
          handleSettings={() => setShowSettings(!showSettings)}
          handleFollowToggle={handleFollowToggle}
          handleMessage={handleMessage}
          handleShare={handleShare}
          isFollowing={isFollowing}
          isBlocked={isBlocked}
        />

        {/* <div className="scroll-prompt" onClick={scrollToContent}>
          <FaChevronDown /> Scroll for more
        </div> */}

        <ProfileDetails
          user={user}
          isEditing={isEditing}
          handleEditChange={handleEditChange}
          handleSaveEdit={handleSaveEdit}
        />

        <Tabs
          selectedIndex={activeTab}
          onSelect={(index) => setActiveTab(index)}
        >
          <TabList>
            <Tab>Posts</Tab>
            <Tab>Projects</Tab>
            <Tab>Saved</Tab>
            {!userId && <Tab>Settings</Tab>}
          </TabList>

          <TabPanel>
            <div className="posts-section">
              {user.posts?.length > 0 ? (
                user.posts.map((post) => (
                  <div key={post.id} className="post-card">
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    <span>
                      {format(new Date(post.created_at), "MMM dd, yyyy")}
                    </span>
                  </div>
                ))
              ) : (
                <p>No posts yet</p>
              )}
            </div>
          </TabPanel>

          <TabPanel>
            <div className="projects-section">
              {user.projects?.length > 0 ? (
                user.projects.map((project) => (
                  <div key={project.id} className="project-card">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="project-links">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaGithub /> GitHub
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No projects yet</p>
              )}
            </div>
          </TabPanel>

          <TabPanel>
            <div className="saved-items-section">
              {user.savedItems?.length > 0 ? (
                user.savedItems.map((item) => (
                  <div key={item.id} className="saved-item-card">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <span>
                      {format(new Date(item.saved_at), "MMM dd, yyyy")}
                    </span>
                  </div>
                ))
              ) : (
                <p>No saved items</p>
              )}
            </div>
          </TabPanel>

          {!userId && (
            <TabPanel>
              <div className="settings-section">
                <h2>Account Settings</h2>
                <form className="settings-form">
                  <div className="setting-group">
                    <h3>Privacy</h3>
                    <label>
                      <input
                        type="checkbox"
                        checked={user.settings?.privateProfile}
                        onChange={(e) =>
                          handleEditChange({
                            target: {
                              name: "settings.privateProfile",
                              value: e.target.checked,
                            },
                          })
                        }
                      />
                      Private Profile
                    </label>
                  </div>

                  <div className="setting-group">
                    <h3>Notifications</h3>
                    <label>
                      <input
                        type="checkbox"
                        checked={user.settings?.emailNotifications}
                        onChange={(e) =>
                          handleEditChange({
                            target: {
                              name: "settings.emailNotifications",
                              value: e.target.checked,
                            },
                          })
                        }
                      />
                      Email Notifications
                    </label>
                  </div>

                  <div className="setting-group">
                    <h3>Theme</h3>
                    <select
                      value={user.settings?.theme}
                      onChange={(e) =>
                        handleEditChange({
                          target: {
                            name: "settings.theme",
                            value: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <button type="button" onClick={handleSaveEdit}>
                    Save Settings
                  </button>
                </form>
              </div>
            </TabPanel>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileView;
