import React, { useState } from "react";
import axios from "axios";
import "./AccountSettings.css";

const AccountSettings = () => {
  // State to hold user details
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [feedback, setFeedback] = useState(""); // For success or error messages

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
    try {
      const token = localStorage.getItem("token"); // Assuming you're storing JWT in localStorage
      const response = await axios.put(
        "http://localhost:5000/api/profile/update", // Adjust to your backend API endpoint
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT for authentication
          },
        }
      );

      if (response.status === 200) {
        setFeedback("Profile updated successfully!");
        // Optionally refresh user data here
      }
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      setFeedback("Failed to update profile. Please try again.");
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
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={userData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" className="update-button">
          Update Profile
        </button>
      </form>

      {feedback && (
        <p className={`feedback ${feedback.includes("Failed") ? "error" : ""}`}>
          {feedback}
        </p>
      )}
    </div>
  );
};

export default AccountSettings;
