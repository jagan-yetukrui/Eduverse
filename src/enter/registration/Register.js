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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:5000/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        const data = await response.json();

        if (response.status === 201) {
          setIsSuccess(true);
          setErrorMessage('');
          setFormData({ name: '', email: '', password: '' });
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else if (response.status === 400 && data.error === 'Email is already registered!') {
          setErrorMessage('Email is already registered! Please log in.');
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

  return (
    <div className="container">
      <div className="register-box">
        <h2>Register for EduVerse</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>

          {isSuccess && <p className="success-text">Registration successful! Redirecting to login...</p>}
          {errorMessage && <p className="error-text">{errorMessage}</p>}
        </form>

        <button onClick={() => navigate('/login')} className="switch-button">
          Already have an account? Login here
        </button>
      </div>
    </div>
  );
};

export default Register;
