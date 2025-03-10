import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";
import {
  FaRocket,
  FaEye,
  FaEyeSlash,
  // FaCheckCircle is imported but never used - removing it
  FaTimesCircle,
  FaGoogle,
  FaLinkedin,
} from "react-icons/fa";
import FirstLogo from "../../First_logo.png";

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
  const navigate = useNavigate();

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
      // Removed the unused 'response' variable
      await axios.post(
        "http://127.0.0.1:8000/api/accounts/register/",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password2: formData.password2,
          agreeToTerms: formData.agreeToTerms,
        }
      );

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

  const renderForm = () => (
    <motion.form
      onSubmit={handleSubmit}
      className="register-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="social-signup">
        <motion.button
          type="button"
          className="social-button google"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaGoogle /> <span>Sign up with Google</span>
        </motion.button>
        <motion.button
          type="button"
          className="social-button linkedin"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaLinkedin /> <span>Sign up with LinkedIn</span>
        </motion.button>
      </div>

      <div className="register-div"></div>

      {Object.entries({
        username: { type: "text", placeholder: "Username" },
        email: { type: "email", placeholder: "Email" },
        password: { type: "password", placeholder: "Password" },
        password2: { type: "password", placeholder: "Confirm Password" },
      }).map(([field, config]) => (
        <div key={field} className="input-group">
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
            whileFocus={{ scale: 1.02 }}
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
              whileHover={{ scale: 1.1 }}
              onClick={() =>
                field === "password"
                  ? setShowPassword(!showPassword)
                  : setShowPassword2(!showPassword2)
              }
            >
              {(field === "password" ? showPassword : showPassword2) ? (
                <FaEye color="#00e5ff"/>
              ) : (
                <FaEyeSlash color="#00e5ff"/>
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
            <div className="error-text">
              <FaTimesCircle /> {errors[field]}
            </div>
          )}
        </div>
      ))}

      <div className="terms-group">
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
          <div className="error-text">
            <FaTimesCircle /> {errors.agreeToTerms}
          </div>
        )}
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
      <div className="cyber-grid"></div>
      <div className="cyber-lines"></div>
      <div className="glow-orbs"></div>

      <motion.div
        className="holographic-panel"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.img
          src={FirstLogo}
          alt="EduVerse"
          className="register-logo"
          style={{ width: "60px", height: "60px" }}
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
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
            <motion.div
              className="success-container"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <FaRocket className="rocket-icon" />
              <p className="success-text">
                Welcome aboard! Redirecting to login...
              </p>
            </motion.div>
          ) : (
            renderForm()
          )}
        </AnimatePresence>

        {errorMessage && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FaTimesCircle /> {errorMessage}
          </motion.div>
        )}

        <motion.button
          onClick={() => navigate("/login")}
          className="login-link"
          whileHover={{ scale: 1.05 }}
        >
          <span>BACK TO LOGIN PAGE</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Register;
