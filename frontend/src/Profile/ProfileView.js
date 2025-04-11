// import axios from "axios";
// import { format, isValid } from "date-fns";
// import React, { useEffect, useState } from "react";
// import {
//   FaChevronDown,
//   FaCog,
//   FaEdit,
//   FaEnvelope,
//   FaGithub,
//   FaLinkedin,
//   FaShare,
// } from "react-icons/fa";
// import { useNavigate, useParams } from "react-router-dom";
// import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
// import "react-tabs/style/react-tabs.css";
// import ErrorMessage from "../components/ErrorMessage";
// import LoadingSpinner from "../components/LoadingSpinner";
// import "./ProfileView.css"; // No changes needed here

// import placeholder from "../images/placeholder.png";

// // Profile Header Component
// const ProfileHeader = ({
//   user,
//   stats,
//   isEditing,
//   handleEditChange,
//   handleSaveEdit,
// }) => (
//   <div className="profile-header-container">
//     {isEditing ? (
//       <div className="edit-profile-form">
//         <input
//           type="text"
//           name="name"
//           value={user.name}
//           onChange={handleEditChange}
//           placeholder="Name"
//         />
//         <input
//           type="text"
//           name="username"
//           value={user.username}
//           onChange={handleEditChange}
//           placeholder="Username"
//         />
//         <textarea
//           name="bio"
//           value={user.bio}
//           onChange={handleEditChange}
//           placeholder="Bio"
//         />
//         <button onClick={handleSaveEdit}>Save Changes</button>
//       </div>
//     ) : (
//       <>
//         <div className="profile-stats">
//           <img
//             className="profile-avatar"
//             src={placeholder} // Updated to use placeholder for now
//             alt="Placeholder Avatar"
//           />
//           <div style={{ display: "flex", gap: "1rem" }}>
//             {Object.entries(stats).map(([key, value]) => (
//               <div key={key} className="stat-item">
//                 <span className="stat-value">{value}</span>
//                 <span className="stat-label">{key}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="profile-content">
//           <h1 className="profile-name">{user.username}</h1>
//           <div
//             style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
//           >
//             <p className="profile-username">@ {user.username}</p>
//             <p className="profile-join-date">
//               Joined
//               {user.joinedDate && isValid(new Date(user.joinedDate))
//                 ? format(new Date(user.joinedDate), "MMMM yyyy")
//                 : " Unknown"}
//             </p>
//             <p className="profile-bio">{user.bio || "No bio provided"}</p>
//           </div>
//         </div>
//       </>
//     )}
//   </div>
// );

// // Profile Actions Component
// const ProfileActions = ({
//   isOwnProfile,
//   handleEdit,
//   handleSettings,
//   handleFollowToggle,
//   handleMessage,
//   handleShare,
//   isFollowing,
// }) => (
//   <div className="profile-actions">
//     {isOwnProfile ? (
//       <>
//         <button className="action-btn edit-btn" onClick={handleEdit}>
//           <FaEdit /> Edit Profile
//         </button>
//         <button className="action-btn settings-btn" onClick={handleSettings}>
//           <FaCog /> Settings
//         </button>
//       </>
//     ) : (
//       <>
//         <button
//           className={`follow-btn ${isFollowing ? "following" : ""}`}
//           onClick={handleFollowToggle}
//         >
//           {isFollowing ? "Following" : "Follow"}
//         </button>
//         <button className="message-btn" onClick={handleMessage}>
//           Message
//         </button>
//       </>
//     )}
//     <button className="action-btn share-btn" onClick={handleShare}>
//       <FaShare /> Share
//     </button>
//   </div>
// );

// // Profile Details Component with Edit Mode
// const ProfileDetails = ({
//   user,
//   isEditing,
//   handleEditChange,
//   handleSaveEdit,
// }) => (
//   <div className="profile-details-container">
//     <section className="education-section">
//       <h3>Education</h3>
//       {isEditing ? (
//         <div className="edit-education">
//           {user.education?.map((edu, index) => (
//             <div key={index} className="edit-education-item">
//               <input
//                 type="text"
//                 name={`education[${index}].school`}
//                 value={edu.school}
//                 onChange={handleEditChange}
//                 placeholder="School"
//               />
//               <input
//                 type="text"
//                 name={`education[${index}].degree`}
//                 value={edu.degree}
//                 onChange={handleEditChange}
//                 placeholder="Degree"
//               />
//               <input
//                 type="text"
//                 name={`education[${index}].year`}
//                 value={edu.year}
//                 onChange={handleEditChange}
//                 placeholder="Year"
//               />
//             </div>
//           ))}
//           <button onClick={() => handleEditChange({ type: "ADD_EDUCATION" })}>
//             Add Education
//           </button>
//         </div>
//       ) : user.education?.length > 0 ? (
//         user.education.map((edu, index) => (
//           <div key={index} className="education-item">
//             <h4>{edu.school}</h4>
//             <p>{edu.degree}</p>
//             <p>{edu.year}</p>
//           </div>
//         ))
//       ) : (
//         <p className="empty-section">No education information provided</p>
//       )}
//     </section>

//     <section className="experience-section">
//       <h3>Experience</h3>
//       {isEditing ? (
//         <div className="edit-experience">
//           {user.experience?.map((exp, index) => (
//             <div key={index} className="edit-experience-item">
//               <input
//                 type="text"
//                 name={`experience[${index}].company`}
//                 value={exp.company}
//                 onChange={handleEditChange}
//                 placeholder="Company"
//               />
//               <input
//                 type="text"
//                 name={`experience[${index}].position`}
//                 value={exp.position}
//                 onChange={handleEditChange}
//                 placeholder="Position"
//               />
//               <input
//                 type="text"
//                 name={`experience[${index}].duration`}
//                 value={exp.duration}
//                 onChange={handleEditChange}
//                 placeholder="Duration"
//               />
//             </div>
//           ))}
//           <button onClick={() => handleEditChange({ type: "ADD_EXPERIENCE" })}>
//             Add Experience
//           </button>
//         </div>
//       ) : user.experience?.length > 0 ? (
//         user.experience.map((exp, index) => (
//           <div key={index} className="experience-item">
//             <h4>{exp.company}</h4>
//             <p>{exp.position}</p>
//             <p>{exp.duration}</p>
//           </div>
//         ))
//       ) : (
//         <p className="empty-section">No experience information provided</p>
//       )}
//     </section>

//     <section className="skills-section">
//       <h3>Skills</h3>
//       {isEditing ? (
//         <div className="edit-skills">
//           <input
//             type="text"
//             name="newSkill"
//             placeholder="Add new skill"
//             onKeyPress={(e) => {
//               if (e.key === "Enter") {
//                 handleEditChange({
//                   type: "ADD_SKILL",
//                   payload: e.target.value,
//                 });
//                 e.target.value = "";
//               }
//             }}
//           />
//           <div className="skills-container">
//             {user.skills?.map((skill, index) => (
//               <span key={index} className="skill-tag">
//                 {skill}
//                 <button
//                   onClick={() =>
//                     handleEditChange({
//                       type: "REMOVE_SKILL",
//                       payload: index,
//                     })
//                   }
//                 >
//                   ×
//                 </button>
//               </span>
//             ))}
//           </div>
//         </div>
//       ) : user.skills?.length > 0 ? (
//         <div className="skills-container">
//           {user.skills.map((skill, index) => (
//             <span key={index} className="skill-tag">
//               {skill}
//             </span>
//           ))}
//         </div>
//       ) : (
//         <p className="empty-section">No skills listed</p>
//       )}
//     </section>
//   </div>
// );

// const UserProfile = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [activeTab, setActiveTab] = useState(0);
//   const [stats, setStats] = useState({
//     followers: 0,
//     following: 0,
//     posts: 0,
//   });
//   const [isFollowing, setIsFollowing] = useState(false);
//   const [showSettings, setShowSettings] = useState(false);

//   const navigate = useNavigate();
//   const { userId } = useParams();

//   const handleEditChange = (e) => {
//     const { name, value } = e.target;
//     setUser((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSaveEdit = async () => {
//     try {
//       await axios.put(`/api/users/${user.id}`, user);
//       setIsEditing(false);
//     } catch (err) {
//       setError("Failed to save changes");
//     }
//   };

//   const handleFollowToggle = async () => {
//     try {
//       if (isFollowing) {
//         await axios.delete(`/api/users/${userId}/follow`);
//       } else {
//         await axios.post(`/api/users/${userId}/follow`);
//       }
//       setIsFollowing(!isFollowing);
//     } catch (err) {
//       setError("Failed to update follow status");
//     }
//   };

//   const handleMessage = () => {
//     navigate(`/messages/new/${userId}`);
//   };

//   const handleShare = () => {
//     navigator.clipboard.writeText(window.location.href);
//   };

//   useEffect(() => {
//     const controller = new AbortController();
//     const fetchUserData = async () => {
//       try {
//         const token = localStorage.getItem("access_token");
//         if (!token) {
//           setError("No access token found. Please log in.");
//           setLoading(false);
//           return;
//         }

//         const response = await axios.get(
//           `http://127.0.0.1:8000/api/profiles/me/`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//             signal: controller.signal,
//           }
//         );
//         setUser(response.data);
//         setStats({
//           followers: response.data.followers_count,
//           following: response.data.following_count,
//         });
//         setIsFollowing(response.data.is_following);
//         setLoading(false);
//       } catch (err) {
//         if (axios.isCancel(err)) {
//           console.log("Fetch cancelled");
//         } else {
//           setError("Failed to fetch user data");
//         }
//         setLoading(false);
//       }
//     };

//     fetchUserData();

//     return () => controller.abort();
//   }, []);

//   if (loading) return <LoadingSpinner />;
//   if (error) return <ErrorMessage message={error} />;
//   if (!user) return <ErrorMessage message="No user data available." />;

//   return (
//     <div className="profile-page">
//       <div className="profile-view-container">
//         <ProfileHeader
//           user={user}
//           stats={stats}
//           isEditing={isEditing}
//           handleEditChange={handleEditChange}
//           handleSaveEdit={handleSaveEdit}
//         />

//         <ProfileActions
//           isOwnProfile={!userId}
//           handleEdit={() => setIsEditing(!isEditing)}
//           handleSettings={() => setShowSettings(!showSettings)}
//           handleFollowToggle={handleFollowToggle}
//           handleMessage={handleMessage}
//           handleShare={handleShare}
//           isFollowing={isFollowing}
//         />

//         <ProfileDetails
//           user={user}
//           isEditing={isEditing}
//           handleEditChange={handleEditChange}
//           handleSaveEdit={handleSaveEdit}
//         />
//       </div>
//     </div>
//   );
// };

// export default UserProfile;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./ProfileView.css";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        {
          console.log(token);
        }
        if (!token) {
          setError("No access token found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch profile data");
        setLoading(false);
        navigate("/login");
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="profile-page">
      <h1>Welcome, {profile.username}</h1>
      {profile && (
        <>
          {profile.profile_picture ? (
            <img className="profile-img" src={profile.profile_picture} alt="Profile" />
          ) : (
            <img className="profile-img" src={require("../images/placeholder.png")} alt="Profile" />
          )}
          <p>Username: {profile.username}</p>
          <p>Bio: {profile.bio}</p>
          <p>Email: {profile.email}</p>
          <p>Education: {profile.education}</p>
          <p>Experience: {profile.experience}</p>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
