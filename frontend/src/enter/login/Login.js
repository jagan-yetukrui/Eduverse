import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { 
  FaRocket, 
  FaEye, 
  FaEyeSlash, 
  FaTimesCircle, 
  FaGraduationCap, 
  FaUsers, 
  FaLightbulb,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
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
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const navigate = useNavigate();

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

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
        const response = await apiClient.post("api/accounts/login/", {
          ...formData
        });

        const { access, refresh } = response.data;
        setTokens(access, refresh);
        setIsSuccess(true);

        setTimeout(() => {
          navigate("/profile");
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

  const features = [
    {
      icon: FaGraduationCap,
      title: "Learn from Experts",
      description: "Access world-class learning resources and connect with industry professionals"
    },
    {
      icon: FaUsers,
      title: "Global Community",
      description: "Join a diverse network of learners and creators from around the world"
    },
    {
      icon: FaLightbulb,
      title: "Innovate Together",
      description: "Share ideas, collaborate on projects, and build the future of education"
    }
  ];

  const nextFeature = () => {
    setIsAutoPlay(false);
    setCurrentFeature((prev) => (prev + 1) % 3);
    setTimeout(() => setIsAutoPlay(true), 10000); // Resume auto-play after 10s
  };

  const prevFeature = () => {
    setIsAutoPlay(false);
    setCurrentFeature((prev) => (prev - 1 + 3) % 3);
    setTimeout(() => setIsAutoPlay(true), 10000); // Resume auto-play after 10s
  };

  const goToFeature = (index) => {
    setIsAutoPlay(false);
    setCurrentFeature(index);
    setTimeout(() => setIsAutoPlay(true), 10000); // Resume auto-play after 10s
  };

  const WelcomeCarousel = () => (
    <div className="welcome-section">
      <div className="welcome-content">
        <div className="welcome-logo">
          <img src={FirstLogo} alt="EduVerse" />
        </div>
        
        <h1 className="welcome-title">
          Welcome to <span className="gradient-text">EduVerse</span>
        </h1>
        
        <p className="welcome-subtitle">
          The future of collaborative learning and knowledge sharing
        </p>
        
        <div className="carousel-container">
          <div className="carousel-wrapper">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="carousel-item"
                initial={false}
                animate={{
                  opacity: index === currentFeature ? 1 : 0,
                  x: index === currentFeature ? 0 : (index < currentFeature ? -50 : 50),
                  scale: index === currentFeature ? 1 : 0.9,
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.4, 0, 0.2, 1],
                }}
                style={{
                  position: index === currentFeature ? 'relative' : 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                }}
              >
                <div className="feature-card">
                  <motion.div
                    className="feature-icon-wrapper"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {React.createElement(feature.icon, { className: "feature-icon" })}
                  </motion.div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="carousel-controls">
            <motion.button
              className="carousel-arrow prev"
              onClick={prevFeature}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaChevronLeft />
            </motion.button>
            
            <div className="carousel-indicators">
              {features.map((_, index) => (
                <motion.button
                  key={index}
                  className={`carousel-dot ${index === currentFeature ? 'active' : ''}`}
                  onClick={() => goToFeature(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
            
            <motion.button
              className="carousel-arrow next"
              onClick={nextFeature}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaChevronRight />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );

  const SuccessAnimation = () => (
    <motion.div
      className="success-container"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      <motion.div
        className="success-icon-wrapper"
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <FaRocket className="rocket-icon" />
      </motion.div>
      <motion.p
        className="success-text"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Launching into EduVerse...
      </motion.p>
    </motion.div>
  );

  return (
    <div className="login-container">
      {/* Animated Background Particles */}
      <div className="background-particles">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            animate={{
              y: [0, -60, 0],
              opacity: [0, 0.2, 0],
            }}
            transition={{
              duration: 12 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 8,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      <div className="login-content">
        {/* Welcome section for larger screens */}
        <div className="welcome-container">
          <WelcomeCarousel />
        </div>

        {/* Login form section */}
        <motion.div
          className="form-container"
          initial={{ opacity: 0, x: 50, rotateY: 15 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <motion.div
            className="holographic-panel"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 1.2, 
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
            whileHover={{ 
              rotateY: 1,
              rotateX: 0.5,
              scale: 1.01,
              boxShadow: "0 20px 60px rgba(102, 126, 234, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1)"
            }}
          >
            <motion.img
              src={FirstLogo}
              alt="EduVerse"
              className="login-logo"
              whileHover={{ 
                scale: 1.05,
                rotate: 5,
                filter: "drop-shadow(0 8px 16px rgba(102, 126, 234, 0.3))"
              }}
              transition={{ duration: 0.3 }}
            />

            <div className="login-div"></div>

            <AnimatePresence>
              {isSuccess ? (
                <SuccessAnimation />
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  className="login-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="input-group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.input
                      type="text"
                      name="username"
                      placeholder="Username or Email"
                      value={formData.username}
                      onChange={handleChange}
                      className={`neon-input ${errors.username ? "invalid" : ""}`}
                      whileFocus={{ 
                        scale: 1.02,
                        boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.2), 0 8px 24px rgba(0, 0, 0, 0.1)"
                      }}
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
                  </motion.div>

                  <motion.div
                    className="input-group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`neon-input ${errors.password ? "invalid" : ""}`}
                      whileFocus={{ 
                        scale: 1.02,
                        boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.2), 0 8px 24px rgba(0, 0, 0, 0.1)"
                      }}
                    />

                    <motion.div
                      className="password-toggle-login"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEye />
                      ) : (
                        <FaEyeSlash />
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
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    className="submit-button"
                    disabled={isLoading}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 12px 32px rgba(102, 126, 234, 0.4)",
                      y: -3
                    }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
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
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
              >
                {errorMessage}
              </motion.div>
            )}

            <motion.button
              onClick={() => navigate("/register")}
              className="register-link"
              whileHover={{ 
                scale: 1.05,
                y: -2,
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              New to EduVerse? Join the future
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
