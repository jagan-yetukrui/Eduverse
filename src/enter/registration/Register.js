import React, { useState } from 'react';
import './Register.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Client-side validation
  const validateForm = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        // Registration request
        const registerResponse = await fetch('http://127.0.0.1:5002/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        const registerData = await registerResponse.json();

        if (registerResponse.ok) {
          // Automatically log in the user after registration
          const loginResponse = await fetch('http://127.0.0.1:5002/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: formData.email, password: formData.password }),
          });
          const loginData = await loginResponse.json();

          if (loginResponse.ok) {
            // Store the JWT token in localStorage
            localStorage.setItem('access_token', loginData.access_token);
            setIsSuccess(true);
            setErrorMessage('');

            // Redirect to profile or home page
            setTimeout(() => {
              navigate('/profile');
            }, 2000);
          } else {
            setErrorMessage(loginData.error || 'Login failed.');
          }
        } else {
          setErrorMessage(registerData.error || 'Registration failed.');
        }
      } catch (error) {
        setErrorMessage('Network error. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container">
      <div className="register-box">
        <h2>Register for EduVerse</h2>
        {isSuccess ? (
          <p className="success-text">Registration and login successful! Redirecting to your profile...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

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
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        {errorMessage && <p className="error-text">{errorMessage}</p>}

        <button onClick={() => navigate('/login')} className="switch-button">
          Already have an account? Login here
        </button>
      </div>
    </div>
  );
};

export default Register;
