import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Assuming you're using react-router for navigation

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);  // To show a load`ing state
  const navigate = useNavigate();  // To redirect the user if necessary

  // This function fetches the protected dashboard data
  const fetchDashboard = async () => {
    const token = localStorage.getItem('token');  // Retrieve the stored JWT token

    if (!token) {
      setErrorMessage('No token found. Please log in again.');
      setLoading(false);
      navigate('/login');  // Redirect to login if token is missing
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,  // Send token in the Authorization header
        },
      });

      const data = await response.json();

      if (response.status === 200) {
        setDashboardData(data);  // Store the dashboard data in state
      } else if (response.status === 401) {
        setErrorMessage('Session expired. Please log in again.');
        localStorage.removeItem('token');  // Remove the token from localStorage
        navigate('/login');  // Redirect to login on token expiration
      } else {
        setErrorMessage('Failed to fetch dashboard data. Please log in again.');
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      {loading ? (
        <p>Loading dashboard...</p>
      ) : errorMessage ? (
        <p className="error-text">{errorMessage}</p>
      ) : (
        dashboardData && (
          <div>
            <p>Welcome, {dashboardData.logged_in_as}!</p>
            <p>This is your dashboard data:</p>
            <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
          </div>
        )
      )}
    </div>
  );
};

export default Dashboard;
