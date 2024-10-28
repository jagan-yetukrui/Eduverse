import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    profileImage: '',
    education: [],
    experience: [],
    skills: [],
    projects: [],
    languages: [],
    socialLinks: {
      linkedin: '',
      github: '',
    },
    privacySettings: {
      profileVisible: true,
    }
  });
  const [newSkill, setNewSkill] = useState('');
  const [newEdu, setNewEdu] = useState({ degree: '', institute: '', startDate: '', endDate: '', desc: '' });
  const [newExp, setNewExp] = useState({ title: '', company: '', startDate: '', endDate: '', desc: '' });
  const [newProject, setNewProject] = useState({ title: '', description: '', startDate: '', endDate: '' });
  const [newLanguage, setNewLanguage] = useState('');
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // Fetch profile data on load
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        toast.error('No token found, redirecting to login.');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://127.0.0.1:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(response.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          toast.error('Failed to fetch profile.');
        }
      }
    };
    fetchProfile();
  }, [token, navigate]);

  // Handle profile image change
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImagePreview(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append('profileImage', file);
      // Handle image upload
      axios.patch('http://127.0.0.1:5000/profile/image', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {
        toast.success('Profile image updated!');
      }).catch(() => {
        toast.error('Failed to upload image.');
      });
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = () => {
    const updatedSkills = [...profileData.skills, newSkill];
    setProfileData({ ...profileData, skills: updatedSkills });
    setNewSkill('');
  };

  const handleAddEdu = () => {
    const updatedEdu = [...profileData.education, newEdu];
    setProfileData({ ...profileData, education: updatedEdu });
    setNewEdu({ degree: '', institute: '', startDate: '', endDate: '', desc: '' });
  };

  const handleAddExp = () => {
    const updatedExp = [...profileData.experience, newExp];
    setProfileData({ ...profileData, experience: updatedExp });
    setNewExp({ title: '', company: '', startDate: '', endDate: '', desc: '' });
  };

  const handleAddProject = () => {
    const updatedProjects = [...profileData.projects, newProject];
    setProfileData({ ...profileData, projects: updatedProjects });
    setNewProject({ title: '', description: '', startDate: '', endDate: '' });
  };

  const handleAddLanguage = () => {
    const updatedLanguages = [...profileData.languages, newLanguage];
    setProfileData({ ...profileData, languages: updatedLanguages });
    setNewLanguage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch('http://127.0.0.1:5000/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Profile update failed.');
    }
  };

  return (
    <div className="profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        {/* Profile Image */}
        <div className="input-group">
          <label>Profile Image</label>
          <input type="file" accept="image/*" onChange={handleProfileImageChange} />
          {profileImagePreview && <img src={profileImagePreview} alt="Profile Preview" className="profile-img-preview" />}
        </div>

        {/* Name */}
        <div className="input-group">
          <label>Name</label>
          <input type="text" name="name" value={profileData.name} onChange={handleChange} required />
        </div>

        {/* Bio */}
        <div className="input-group">
          <label>Bio</label>
          <textarea name="bio" value={profileData.bio} onChange={handleChange} />
        </div>

        {/* Education */}
        <div className="input-group">
          <label>Education</label>
          <input type="text" placeholder="Degree" value={newEdu.degree} onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })} />
          <input type="text" placeholder="Institute" value={newEdu.institute} onChange={(e) => setNewEdu({ ...newEdu, institute: e.target.value })} />
          <input type="text" placeholder="Start Date" value={newEdu.startDate} onChange={(e) => setNewEdu({ ...newEdu, startDate: e.target.value })} />
          <input type="text" placeholder="End Date" value={newEdu.endDate} onChange={(e) => setNewEdu({ ...newEdu, endDate: e.target.value })} />
          <textarea placeholder="Description" value={newEdu.desc} onChange={(e) => setNewEdu({ ...newEdu, desc: e.target.value })} />
          <button type="button" onClick={handleAddEdu}>Add Education</button>
        </div>

        {/* Experience */}
        <div className="input-group">
          <label>Experience</label>
          <input type="text" placeholder="Job Title" value={newExp.title} onChange={(e) => setNewExp({ ...newExp, title: e.target.value })} />
          <input type="text" placeholder="Company Name" value={newExp.company} onChange={(e) => setNewExp({ ...newExp, company: e.target.value })} />
          <input type="text" placeholder="Start Date" value={newExp.startDate} onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })} />
          <input type="text" placeholder="End Date" value={newExp.endDate} onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })} />
          <textarea placeholder="Description" value={newExp.desc} onChange={(e) => setNewExp({ ...newExp, desc: e.target.value })} />
          <button type="button" onClick={handleAddExp}>Add Experience</button>
        </div>

        {/* Skills */}
        <div className="input-group">
          <label>Skills</label>
          <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} />
          <button type="button" onClick={handleAddSkill}>Add Skill</button>
          <div className="skills-list">
            {profileData.skills.map((skill, index) => (
              <div key={index}>{skill}</div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="input-group">
          <label>Projects</label>
          <input type="text" placeholder="Project Title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
          <textarea placeholder="Project Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
          <button type="button" onClick={handleAddProject}>
          Add Project</button>
        </div>

        {/* Languages */}
        <div className="input-group">
          <label>Languages</label>
          <input type="text" value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} />
          <button type="button" onClick={handleAddLanguage}>Add Language</button>
          <div className="languages-list">
            {profileData.languages.map((language, index) => (
              <div key={index}>{language}</div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="input-group">
          <label>LinkedIn</label>
          <input
            type="text"
            name="linkedin"
            value={profileData.socialLinks.linkedin}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                socialLinks: {
                  ...profileData.socialLinks,
                  linkedin: e.target.value,
                },
              })
            }
          />
        </div>

        <div className="input-group">
          <label>GitHub</label>
          <input
            type="text"
            name="github"
            value={profileData.socialLinks.github}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                socialLinks: {
                  ...profileData.socialLinks,
                  github: e.target.value,
                },
              })
            }
          />
        </div>

        {/* Privacy Settings */}
        <div className="input-group">
          <label>Profile Visibility</label>
          <select
            name="profileVisible"
            value={profileData.privacySettings.profileVisible}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                privacySettings: {
                  ...profileData.privacySettings,
                  profileVisible: e.target.value === "true",
                },
              })
            }
          >
            <option value="true">Public</option>
            <option value="false">Private</option>
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
};

export default Profile;
