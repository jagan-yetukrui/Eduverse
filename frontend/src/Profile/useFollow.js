import { useState } from 'react';
import profileService from '../api';

export const useFollow = (profileId, initialIsFollowing = false, initialFollowers = 0) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowers);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      await profileService.toggleFollow(profileId, isFollowing);
      setIsFollowing(!isFollowing);
      setFollowersCount((prev) => prev + (isFollowing ? -1 : 1));
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, followersCount, toggleFollow, loading };
};
