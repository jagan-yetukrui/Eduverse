import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProfileView.css';
import { FaGithub, FaLinkedin, FaShare, FaEnvelope } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import PostsFeed from '../components/PostsFeed';
import ProjectsList from '../components/ProjectsList';
import SavedItems from '../components/SavedItems';

const ProfileView = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const { userId } = useParams();
  const [stats, setStats] = useState({
    posts: 0,
    projects: 0,
    followers: 0,
    following: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/profiles/${userId || 'me'}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setUser(response.data);
        
        // Fetch user stats
        const statsResponse = await axios.get(
          `http://127.0.0.1:8000/api/profiles/${userId || 'me'}/stats`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setStats(statsResponse.data);
        
        // Check if following (only if viewing other's profile)
        if (userId) {
          const followResponse = await axios.get(
            `http://127.0.0.1:8000/api/profiles/${userId}/following-status`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setIsFollowing(followResponse.data.isFollowing);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Could not fetch profile data. Please try again.');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate, userId]);

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const endpoint = `http://127.0.0.1:8000/api/profiles/${userId}/${isFollowing ? 'unfollow' : 'follow'}`;
      await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Error toggling follow status:', err);
    }
  };

  const handleMessage = () => {
    navigate(`/messages/new/${userId}`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    } catch (err) {
      console.error('Error sharing profile:', err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return <ErrorMessage message="No user data available." />;

  return (
    <div className="profile-view-container">
      <div className="profile-banner" style={{backgroundImage: `url(${user.bannerUrl || '/default-banner.jpg'})`}}>
        <div className="holographic-overlay"></div>
      </div>

      <div className="profile-header">
        <img
          className="profile-avatar"
          src={user.avatarUrl || "https://via.placeholder.com/150"}
          alt={`${user.name}'s avatar`}
        />
        
        <div className="profile-details">
          <div className="profile-main-info">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-username">@{user.username}</p>
            <p className="profile-join-date">
              Joined {format(new Date(user.joinedDate), 'MMMM yyyy')}
            </p>
            <p className="profile-bio">{user.bio || 'No bio provided'}</p>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.posts}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.projects}</span>
              <span className="stat-label">Projects</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.followers}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.following}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>

          <div className="profile-social-links">
            {user.email && (
              <a href={`mailto:${user.email}`} aria-label="Email">
                <FaEnvelope className="social-icon" />
              </a>
            )}
            {user.linkedin && (
              <a href={user.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin className="social-icon" />
              </a>
            )}
            {user.github && (
              <a href={user.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub className="social-icon" />
              </a>
            )}
          </div>

          <div className="profile-actions">
            {!userId ? (
              <button className="edit-profile-btn" onClick={() => navigate('/profile/edit')}>
                Edit Profile
              </button>
            ) : (
              <>
                <button 
                  className={`follow-btn ${isFollowing ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button className="message-btn" onClick={handleMessage}>
                  Message
                </button>
              </>
            )}
            <button className="share-btn" onClick={handleShare}>
              <FaShare /> Share
            </button>
          </div>
        </div>
      </div>

      <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
        <TabList>
          <Tab>Posts</Tab>
          <Tab>Projects</Tab>
          <Tab>Saved</Tab>
          {!userId && <Tab>Settings</Tab>}
        </TabList>

        <TabPanel>
          <PostsFeed userId={userId || user.id} />
        </TabPanel>
        
        <TabPanel>
          <ProjectsList userId={userId || user.id} />
        </TabPanel>
        
        <TabPanel>
          <SavedItems userId={userId || user.id} />
        </TabPanel>

        {!userId && (
          <TabPanel>
            <div className="settings-section">
              <button onClick={() => navigate('/settings')}>
                Account Settings
              </button>
              <button onClick={() => navigate('/settings/privacy')}>
                Privacy Settings
              </button>
            </div>
          </TabPanel>
        )}
      </Tabs>
    </div>
  );
};

export default ProfileView;
