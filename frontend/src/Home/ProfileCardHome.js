import React from 'react';
import './ProfileCardHome.css';

const ProfileCardHome = ({ profile, onFollow }) => {
  return (
    <div className="profile-card">
      <img src={profile.picture} alt={`${profile.name}'s profile`} className="profile-image" />
      <div className="profile-info">
        <p className="profile-username">{profile.username}</p>
        {profile.reason && <p className="profile-reason">{profile.reason}</p>}
        {profile.mutuals && <p className="profile-mutuals">Followed by {profile.mutuals.join(', ')}</p>}
        <button className="follow-button" onClick={() => onFollow(profile.id)}>
          {profile.isFollowing ? 'Requested' : 'Follow'}
        </button>
      </div>
    </div>
  );
};

export default ProfileCardHome;
