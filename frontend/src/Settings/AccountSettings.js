import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AccountSettings.css";

const AccountSettings = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Password validation rules
  const passwordRules = {
    minLength: 8,
    hasUpperCase: /[A-Z]/,
    hasLowerCase: /[a-z]/,
    hasNumbers: /\d/,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
  };

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/profiles/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUserData(prevData => ({
          ...prevData,
          username: response.data.username,
          email: response.data.email
        }));

      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
    setHasChanges(true);
    setFeedback({ message: "", type: "" }); // Clear previous feedback
  };

  // Validate password
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < passwordRules.minLength) {
      errors.push(`Password must be at least ${passwordRules.minLength} characters long`);
    }
    if (!passwordRules.hasUpperCase.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!passwordRules.hasLowerCase.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!passwordRules.hasNumbers.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!passwordRules.hasSpecialChar.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return errors;
  };

  // Handle error display
  const handleError = (error) => {
    const errorMessage = error.response?.data?.detail || error.message;
    setFeedback({
      message: errorMessage,
      type: "error"
    });

    if (error.response?.status === 401) {
      navigate('/login');
    }
  };

  // Handle form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback({ message: "", type: "" });

    try {
      // Validate passwords if changing password
      if (userData.new_password) {
        if (userData.new_password !== userData.confirm_password) {
          throw new Error("New passwords do not match");
        }
        if (!userData.current_password) {
          throw new Error("Current password is required to set a new password");
        }

        const passwordErrors = validatePassword(userData.new_password);
        if (passwordErrors.length > 0) {
          throw new Error(passwordErrors.join("\n"));
        }
      }

      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }

      // Prepare update data
      const updateData = {
        username: userData.username,
        email: userData.email
      };

      // Add password data if updating password
      if (userData.new_password) {
        updateData.current_password = userData.current_password;
        updateData.new_password = userData.new_password;
      }

      // Send update request
      await axios.put(
        '/api/profiles/me/',
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setFeedback({
        message: "Profile updated successfully!",
        type: "success"
      });

      // Clear password fields
      setUserData(prev => ({
        ...prev,
        current_password: "",
        new_password: "",
        confirm_password: ""
      }));

      setHasChanges(false);

    } catch (error) {
      handleError(error);
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

        <div className="password-section">
          <h3>Change Password</h3>
          
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
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="update-button" 
            disabled={isLoading || !hasChanges}
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>

      {feedback.message && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {/* Password requirements info */}
      {userData.new_password && (
        <div className="password-requirements">
          <h4>Password Requirements:</h4>
          <ul>
            <li className={userData.new_password.length >= passwordRules.minLength ? "met" : ""}>
              At least {passwordRules.minLength} characters long
            </li>
            <li className={passwordRules.hasUpperCase.test(userData.new_password) ? "met" : ""}>
              Contains uppercase letter
            </li>
            <li className={passwordRules.hasLowerCase.test(userData.new_password) ? "met" : ""}>
              Contains lowercase letter
            </li>
            <li className={passwordRules.hasNumbers.test(userData.new_password) ? "met" : ""}>
              Contains number
            </li>
            <li className={passwordRules.hasSpecialChar.test(userData.new_password) ? "met" : ""}>
              Contains special character
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
