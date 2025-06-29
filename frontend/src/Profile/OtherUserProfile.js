import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaCheck, FaCopy } from 'react-icons/fa';
import { useUser } from '../Accounts/UserContext';
import './OtherUserProfile.css';
import profileService from '../services/profileService';

const OtherUserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    const loadFollowData = async () => {
      if (!username) return;

      setTabLoading(true);
      try {
        if (activeTab === 'followers') {
          const data = await profileService.getFollowers(username);
          setFollowersList(data);
        } else if (activeTab === 'following') {
          const data = await profileService.getFollowing(username);
          setFollowingList(data);
        }
      } catch (err) {
        console.error('Error loading follow data:', err.message);
      } finally {
        setTabLoading(false);
      }
    };

    loadFollowData();
  }, [activeTab, username]);

  // Redirect to self profile if viewing own profile
  useEffect(() => {
    if (username === currentUser?.username) {
      navigate('/profile');
      return;
    }
  }, [username, currentUser, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await profileService.getUserProfileByUsername(username);
        setUser(data);
        setIsFollowing(data.is_following);
      } catch (err) {
        console.error('Failed to load user:', err);
        if (err.response?.status === 404) {
          setError('User not found');
        } else if (err.response?.status === 401) {
          setError('Please log in to view this profile');
        } else {
          setError(err.response?.data?.error || 'Failed to load user profile');
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username]);

  // Early return if viewing own profile
  if (username === currentUser?.username) {
    return null;
  }

  // const handleFollow = async () => {
  //   try {
  //     if (isFollowing) {
  //       await axios.post(`/api/users/${username}/unfollow`);
  //       setUser(prev => ({
  //         ...prev,
  //         followers_count: prev.followers_count - 1
  //       }));
  //     } else {
  //       await axios.post(`/api/users/${username}/follow`);
  //       setUser(prev => ({
  //         ...prev,
  //         followers_count: prev.followers_count + 1
  //       }));
  //     }
  //     setIsFollowing(!isFollowing);
  //   } catch (err) {
  //     setError(err.response?.data?.message || 'Failed to update follow status');
  //   }
  // };

  const handleFollow = async () => {
    try {
      setFollowLoading(true);

      const action = isFollowing ? "unfollow" : "follow";

      await profileService.followOrUnfollowUser(username, action);

      // Update follow status and follower count
      setIsFollowing(!isFollowing);
      setUser(prev => ({
        ...prev,
        followers_count: prev.followers_count + (isFollowing ? -1 : 1)
      }));

      toast.success(`Successfully ${action}ed ${username}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update follow status';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFollowLoading(false);
    }
  };


  const copyProfileLink = () => {
    const profileUrl = `${window.location.origin}/profile/${username}`;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="other-profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="other-profile-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button
              className="primary-button"
              onClick={() => navigate('/profile')}
            >
              Return to Your Profile
            </button>
            <button
              className="secondary-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="other-profile-page">
      <motion.div
        className="profile-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-header">
          <img
            src={user.avatar_url || '/default-avatar.png'}
            alt={`${user.display_name}'s avatar`}
            className="profile-avatar"
          />
          <div className="profile-info">
            <h1 className="profile-name">{user.display_name}</h1>
            <div
              className={`profile-username ${copied ? 'copied' : ''}`}
              onClick={copyProfileLink}
            >
              @{user.username}
              {copied ? <FaCheck className="copy-icon" /> : <FaCopy className="copy-icon" />}
            </div>
            <p className="profile-bio">{user.bio || 'No bio yet'}</p>
            <button
              className={`follow-button ${isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item" onClick={() => setActiveTab('posts')}>
            <span className="stat-value">{user.posts_count || 0}</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="stat-item" onClick={() => setActiveTab('followers')}>
            <span className="stat-value">{user.followers_count || 0}</span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="stat-item" onClick={() => setActiveTab('following')}>
            <span className="stat-value">{user.following_count || 0}</span>
            <span className="stat-label">Following</span>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button
            className={`tab-button ${activeTab === 'followers' ? 'active' : ''}`}
            onClick={() => setActiveTab('followers')}
          >
            Followers
          </button>
          <button
            className={`tab-button ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            Following
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'posts' && (
            <div className="posts-grid">
              {user.posts?.length > 0 ? (
                user.posts.map(post => (
                  <div key={post.id} className="post-card">
                    {/* Post content */}
                  </div>
                ))
              ) : (
                <div className="empty-card">
                  <p>No posts yet</p>
                </div>
              )}
            </div>
          )}
          <div className="user-list-scroll">
            {(activeTab === 'followers' ? followersList : followingList).map(user => (
              <div key={user.id} className="user-row">
                <img src={user.avatar || '/default-avatar.png'} alt={user.username} className="user-avatar" />
                <div className="user-info">
                  <span className="username">@{user.username}</span>
                  {user.display_name && <span className="displayname">{user.display_name}</span>}
                </div>
                
              </div>
            ))}
          </div>


          
        </div>
      </motion.div>
    </div>
  );
};

export default OtherUserProfile; 