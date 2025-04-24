import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { FaEye, FaEyeSlash, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import ParticlesBg from "particles-bg";

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: "https://edu-verse.in/",
});

<<<<<<< HEAD
=======
// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const response = await axios.post(
            "https://edu-verse.in/api/token/refresh/",
            {
              refresh: refreshToken,
            }
          );
          const newAccessToken = response.data.access;
          localStorage.setItem("access_token", newAccessToken);

          // Retry original request with new token
          error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return apiClient.request(error.config);
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

>>>>>>> origin/MVP
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
    const token = localStorage.getItem("token");  // ✅ Make sure it's the same as NewPost.js
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
        const response = await axios.post("http://127.0.0.1:8000/api/token/", {  // ✅ Use correct endpoint
          username: formData.username,
          password: formData.password,
        });

        if (response.status === 200) {
          // ✅ Save the JWT token using the correct key
          localStorage.setItem("token", response.data.access);
          localStorage.setItem("refresh_token", response.data.refresh);
          navigate("/profile"); // Navigate to profile or dashboard
        }
      } catch (error) {
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
      <ParticlesBg type="cobweb" bg={true} color="#bfc3f7" />

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
          Register
        </button>
      </div>
    </div>
  );
};

export default Login;
