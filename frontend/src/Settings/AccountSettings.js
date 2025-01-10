import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AccountSettings.css";

const AccountSettings = () => {
  // State to hold user details
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [feedback, setFeedback] = useState(""); // For success or error messages
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('/api/profiles/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUserData(prevData => ({
          ...prevData,
          username: response.data.username,
          email: response.data.email
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
        setFeedback("Failed to load user data.");
      }
    };
    fetchUserData();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback("");

    // Validate passwords match if changing password
    if (userData.new_password) {
      if (userData.new_password !== userData.confirm_password) {
        setFeedback("New passwords do not match");
        setIsLoading(false);
        return;
      }
      if (!userData.current_password) {
        setFeedback("Current password is required to set a new password");
        setIsLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      const updateData = {
        username: userData.username,
        email: userData.email
      };

      // Only include password data if user is updating password
      if (userData.new_password) {
        updateData.current_password = userData.current_password;
        updateData.new_password = userData.new_password;
      }

      // eslint-disable-next-line no-unused-vars
      const response = await axios.put(
        '/api/profiles/me/update/',
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );

      setFeedback("Profile updated successfully!");
      
      // Clear password fields
      setUserData(prevData => ({
        ...prevData,
        current_password: "",
        new_password: "",
        confirm_password: ""
      }));

    } catch (error) {
      console.error("Error updating profile:", error);
      setFeedback(error.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="account-settings-container">
      <h2>Account Settings</h2>
      <form onSubmit={handleUpdate}>
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={userData.username}
            onChange={handleInputChange}
            placeholder="Enter your username"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="current_password">Current Password</label>
          <input
            type="password"
            id="current_password"
            name="current_password"
            value={userData.current_password}
            onChange={handleInputChange}
            placeholder="Enter current password to change password"
          />
        </div>

        <div className="input-group">
          <label htmlFor="new_password">New Password</label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            value={userData.new_password}
            onChange={handleInputChange}
            placeholder="Enter new password"
          />
        </div>

        <div className="input-group">
          <label htmlFor="confirm_password">Confirm New Password</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            value={userData.confirm_password}
            onChange={handleInputChange}
            placeholder="Confirm new password"
          />
        </div>

        <button type="submit" className="update-button" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Profile"}
        </button>
      </form>

      {feedback && (
        <p className={`feedback ${feedback.includes("Failed") || feedback.includes("required") ? "error" : "success"}`}>
          {feedback}
        </p>
      )}
    </div>
  );
};

export default AccountSettings;
