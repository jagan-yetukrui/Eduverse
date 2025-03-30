import React from "react";
import "./ProfileCardHome.css";

import placeholder from "../images/placeholder.png";

const ProfileCardHome = ({ profile, onFollow }) => {
  return (
    <div className="profile-card">
      <img
        src={placeholder}
        alt={placeholder}
        className="profile-image"
      />
      <div className="profile-info">
        <p className="profile-username">{profile.username}</p>
        {/* {profile.reason && <p className="profile-reason">{profile.reason}</p>} */}
        <p className="profile-bio">{profile.bio}</p>
        <p className="profile-follower">{profile.followers_count} followers</p>
        {profile.mutuals && (
          <p className="profile-mutuals">
            Followed by {profile.mutuals.join(", ")}
          </p>
        )}
      </div>
      <button className="follow-button" onClick={() => onFollow(profile.id)}>
        {profile.isFollowing ? "Requested" : "Follow"}
      </button>
    </div>
  );
};

export default ProfileCardHome;
