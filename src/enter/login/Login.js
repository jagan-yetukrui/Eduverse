import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email address is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters long';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);

      try {
        const response = await fetch('http://127.0.0.1:5000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.status === 200) {
          if (data.access_token) {
            // Store the JWT token in localStorage
            localStorage.setItem('token', data.access_token);
            setIsSuccess(true);
            setErrorMessage('');
            setSnackbarOpen(true);
            // Redirect to profile page
            navigate('/profile');
          } else {
            // User is registered but no profile is found
            setErrorMessage('No profile found. Please complete your registration.');
          }
        } else if (response.status === 404) {
          // User not found or not registered
          setErrorMessage('No profile exists for this email. Please register.');
        } else {
          setErrorMessage(data.error || 'An error occurred. Please try again.');
        }
      } catch (error) {
        setErrorMessage('Network error. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="container">
      <div className="login-box">
        <h2>Login to EduVerse</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          {isSuccess && <p className="success-text">Login successful! Welcome back.</p>}
          {errorMessage && <p className="error-text">{errorMessage}</p>}
        </form>

        <button onClick={handleSwitchToRegister} className="switch-button">
          Don't have an account? Register here
        </button>

        {snackbarOpen && (
          <div className="snackbar">
            Login successful! Welcome back.
            <button onClick={() => setSnackbarOpen(false)} className="snackbar-close">&times;</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
