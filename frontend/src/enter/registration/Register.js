import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";
import {
  FaRocket,
  FaEye,
  FaEyeSlash,
  FaTimesCircle,
  FaGoogle,
  FaLinkedin,
  FaGraduationCap,
  FaUsers,
  FaLightbulb,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import FirstLogo from "../../First_logo.png";
import { getDeviceFingerprint } from "../../utils/tokenManager";

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: "https://edu-verse.in/",
});

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "", // Renamed from confirmPassword to match API
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false); // Renamed to match
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isEmailValid, setIsEmailValid] = useState(null);
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(email));
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear specific error when field is being edited
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    if (name === "email") validateEmail(value);
    if (name === "password") {
      calculatePasswordStrength(value);
      // Check password2 match if it exists
      if (formData.password2) {
        if (value !== formData.password2) {
          setErrors((prev) => ({
            ...prev,
            password2: "Passwords don't match",
          }));
        } else {
          setErrors((prev) => ({ ...prev, password2: "" }));
        }
      }
    }
    if (name === "password2") {
      if (value !== formData.password) {
        setErrors((prev) => ({ ...prev, password2: "Passwords don't match" }));
      } else {
        setErrors((prev) => ({ ...prev, password2: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!isEmailValid)
      newErrors.email = "Please enter a valid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (!formData.password2)
      newErrors.password2 = "Please confirm your password";
    else if (formData.password !== formData.password2) {
      newErrors.password2 = "Passwords don't match";
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const deviceFingerprint = await getDeviceFingerprint();
      await apiClient.post("api/accounts/register/", {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password2: formData.password2,
          agreeToTerms: formData.agreeToTerms,
        device_fingerprint: deviceFingerprint
      });

      setIsSuccess(true);
      setErrorMessage("");
      setErrors({});

      // Delay navigation to show success message
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      const errorData = error.response?.data;

      // Handle different error formats from backend
      if (typeof errorData === "object") {
        const newErrors = {};
        Object.keys(errorData).forEach((key) => {
          newErrors[key] = Array.isArray(errorData[key])
            ? errorData[key][0]
            : errorData[key];
        });
        setErrors(newErrors);
        setErrorMessage(Object.values(newErrors)[0]); // Show first error as main message
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: FaGraduationCap,
      title: "Access World-Class Resources",
      description: "Learn from industry experts and access premium educational content"
    },
    {
      icon: FaUsers,
      title: "Join Global Community",
      description: "Connect with learners and creators from around the world"
    },
    {
      icon: FaLightbulb,
      title: "Innovate & Collaborate",
      description: "Share ideas, build projects, and shape the future of education"
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
          Join <span className="gradient-text">EduVerse</span>
        </h1>
        
        <p className="welcome-subtitle">
          Start your journey in the future of collaborative learning and knowledge sharing
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
        Welcome aboard! Redirecting to login...
      </motion.p>
    </motion.div>
  );

  const renderForm = () => (
    <motion.form
      onSubmit={handleSubmit}
      className="register-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="social-signup"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.button
          type="button"
          className="social-button google"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaGoogle /> <span>Sign up with Google</span>
        </motion.button>
        <motion.button
          type="button"
          className="social-button linkedin"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaLinkedin /> <span>Sign up with LinkedIn</span>
        </motion.button>
      </motion.div>

      <div className="register-div"></div>

      {Object.entries({
        username: { type: "text", placeholder: "Username" },
        email: { type: "email", placeholder: "Email" },
        password: { type: "password", placeholder: "Password" },
        password2: { type: "password", placeholder: "Confirm Password" },
      }).map(([field, config], index) => (
        <motion.div 
          key={field} 
          className="input-group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + index * 0.1 }}
        >
          <motion.input
            type={
              field.includes("password")
                ? field === "password"
                  ? showPassword
                    ? "text"
                    : "password"
                  : showPassword2
                  ? "text"
                  : "password"
                : config.type
            }
            name={field}
            placeholder={config.placeholder}
            value={formData[field]}
            onChange={handleChange}
            whileFocus={{ 
              scale: 1.02,
              boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.2), 0 8px 24px rgba(0, 0, 0, 0.1)"
            }}
            className={`neon-input ${
              field === "email"
                ? isEmailValid === true
                  ? "valid"
                  : isEmailValid === false
                  ? "invalid"
                  : ""
                : ""
            } ${errors[field] ? "error" : ""}`}
          />
          {field.includes("password") && (
            <motion.div
              className="password-toggle-register"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                field === "password"
                  ? setShowPassword(!showPassword)
                  : setShowPassword2(!showPassword2)
              }
            >
              {(field === "password" ? showPassword : showPassword2) ? (
                <FaEye />
              ) : (
                <FaEyeSlash />
              )}
              {(field === "password" ? showPassword : showPassword2)
                ? "Hide Password"
                : "Show Password"}
            </motion.div>
          )}
          {field === "password" && (
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
          )}
          {errors[field] && (
            <motion.div 
              className="error-text"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <FaTimesCircle /> {errors[field]}
            </motion.div>
          )}
        </motion.div>
      ))}

      <motion.div 
        className="terms-group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <label className="terms-label">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
          />
          <span className="checkmark"></span>
          <span>I agree to the Terms and Conditions</span>
        </label>
        {errors.agreeToTerms && (
          <motion.div 
            className="error-text"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <FaTimesCircle /> {errors.agreeToTerms}
          </motion.div>
        )}
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
        transition={{ delay: 0.7 }}
      >
        {isLoading ? (
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <span>Join EduVerse</span>
        )}
      </motion.button>
    </motion.form>
  );

  return (
    <div className="register-container">
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

      <div className="register-content">
        {/* Welcome section for larger screens */}
        <div className="welcome-container">
          <WelcomeCarousel />
        </div>

        {/* Registration form section */}
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
              className="register-logo"
              whileHover={{ 
                scale: 1.05,
                rotate: 5,
                filter: "drop-shadow(0 8px 16px rgba(102, 126, 234, 0.3))"
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="register-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p>Join the Future of Learning and Collaboration</p>
            </motion.div>

            <AnimatePresence>
              {isSuccess ? (
                <SuccessAnimation />
              ) : (
                renderForm()
              )}
            </AnimatePresence>

            {errorMessage && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
              >
                <FaTimesCircle /> {errorMessage}
              </motion.div>
            )}

            <motion.button
              onClick={() => navigate("/login")}
              className="login-link"
              whileHover={{ 
                scale: 1.05,
                y: -2,
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span>BACK TO LOGIN PAGE</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
