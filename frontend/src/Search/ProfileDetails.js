import React from 'react';
import './ProfileDetails.css';

const ProfileDetails = ({ profile, onFollow }) => {
  return (
    <div className="profile-details">
      <img src={profile.profilePicture} alt={`${profile.name}'s profile`} />
      <h2>{profile.name}</h2>
      <p>{profile.bio}</p>
      <button onClick={() => onFollow(profile.id)}>
        {profile.isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  );
};

export default ProfileDetails;
