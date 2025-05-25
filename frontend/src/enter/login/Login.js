import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { FaRocket, FaEye, FaEyeSlash, FaTimesCircle } from "react-icons/fa";
import FirstLogo from "../../First_logo.png";
import axios from "axios";
import { getDeviceFingerprint, setTokens, isAuthenticated } from "../../utils/tokenManager";

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: "https://edu-verse.in/",
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      
      if (refreshToken) {
        try {
          const deviceFingerprint = await getDeviceFingerprint();
          const response = await axios.post(
            "https://edu-verse.in/api/token/refresh/",
            {
              refresh: refreshToken,
              device_fingerprint: deviceFingerprint
            }
          );
          
          const { access, refresh } = response.data;
          setTokens(access, refresh);
          
          // Retry original request with new token
          originalRequest.headers["Authorization"] = `Bearer ${access}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          // Clear tokens and redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
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
        const deviceFingerprint = await getDeviceFingerprint();
        const response = await apiClient.post("api/token/", {
          ...formData,
          device_fingerprint: deviceFingerprint
        });

        const { access, refresh } = response.data;
        setTokens(access, refresh);
        setIsSuccess(true);

        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (error) {
        if (error.response?.data) {
          const errorData = error.response.data;
          if (typeof errorData === "object") {
            const errorMessage = Object.values(errorData)[0];
            setErrorMessage(
              Array.isArray(errorMessage) ? errorMessage[0] : errorMessage
            );
          } else {
            setErrorMessage("Invalid credentials");
          }
        } else {
          setErrorMessage("Network error. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <motion.div
        className="holographic-panel"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <img
          src={FirstLogo}
          alt="EduVerse"
          className="login-logo"
          style={{ width: "60px", height: "auto" }}
        />

        <div className="login-div"></div>

        <AnimatePresence>
          {isSuccess ? (
            <motion.div
              className="success-container"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <FaRocket className="rocket-icon" />
              <p className="success-text">Launching into EduVerse...</p>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              className="login-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="input-group">
                <motion.input
                  type="text"
                  name="username"
                  placeholder="Username or Email"
                  value={formData.username}
                  onChange={handleChange}
                  className={`neon-input ${errors.username ? "invalid" : ""}`}
                />
                {errors.username && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="validation-icon"
                  >
                    <FaTimesCircle className="invalid-icon" />
                  </motion.div>
                )}
              </div>

              <div className="input-group">
                <motion.input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`neon-input ${errors.password ? "invalid" : ""}`}
                />

                <motion.div
                  className="password-toggle-login"
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEye color="white" />
                  ) : (
                    <FaEyeSlash color="white" />
                  )}
                  {showPassword ? "Hide Password" : "Show Password"}
                </motion.div>

                <div className="strength-meter">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`strength-segment ${
                        i < passwordStrength ? "active" : ""
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                    />
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                className="submit-button"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <motion.div
                    className="loading-spinner"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ) : (
                  "Enter EduVerse"
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {errorMessage && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {errorMessage}
          </motion.div>
        )}

        <motion.button
          onClick={() => navigate("/register")}
          className="register-link"
          whileHover={{ scale: 1.05, textShadow: "0 0 8px rgb(255,255,255)" }}
        >
          New to EduVerse? Join the future
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Login;
