import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { FaEye, FaEyeSlash, FaTimesCircle } from "react-icons/fa";
import axios from "axios";

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/",
});

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/profile");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.username)
      newErrors.username = "Username or Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await axios.post("http://127.0.0.1:8000/api/login/", {
          username: formData.username,
          password: formData.password,
        });

        if (response.status === 200) {
          // Save the JWT token in localStorage or state for further requests
          localStorage.setItem("access_token", response.data.access);
          localStorage.setItem('refresh_token', response.data.refresh);
          // setIsSuccess(true);
          navigate("/profile"); // Navigate to profile or dashboard
        }
      } catch (error) {
        // Display the error message from the backend
        setErrorMessage(
          error.response?.data.detail || "Login failed. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-panel">
        <img
          src={require("../../First_logo.png")}
          alt="EduVerse"
          className="login-logo"
        />

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder="Username or Email"
              value={formData.username}
              onChange={handleChange}
              className={`neon-input ${errors.username ? "invalid" : ""}`}
            />
            {errors.username && (
              <div className="validation-icon">
                <FaTimesCircle className="invalid-icon" />
              </div>
            )}
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`neon-input ${errors.password ? "invalid" : ""}`}
            />

            <div
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
              {showPassword ? "Hide Password" : "Show Password"}
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <button onClick={() => navigate("/register")} className="register-link">
          New to EduVerse? Join the future
        </button>
      </div>
    </div>
  );
};

export default Login;
