import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDesktop, FaMobile, FaTablet, FaTrash } from 'react-icons/fa';
import { getTokenUsage, clearTokens } from '../utils/tokenManager';
import axios from 'axios';
import './SessionManager.css';

const SessionManager = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('https://edu-verse.in/api/accounts/sessions/');
      setSessions(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch sessions');
      setLoading(false);
    }
  };

  const handleLogout = async (sessionId) => {
    try {
      await axios.post('https://edu-verse.in/api/token/logout/', {
        session_id: sessionId
      });
      fetchSessions();
    } catch (error) {
      setError('Failed to logout session');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await axios.post('https://edu-verse.in/api/token/logout-all/');
      clearTokens();
      window.location.href = '/login';
    } catch (error) {
      setError('Failed to logout all sessions');
    }
  };

  const getDeviceIcon = (userAgent) => {
    if (userAgent?.toLowerCase().includes('mobile')) {
      return <FaMobile />;
    } else if (userAgent?.toLowerCase().includes('tablet')) {
      return <FaTablet />;
    }
    return <FaDesktop />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="session-loading">Loading sessions...</div>;
  }

  if (error) {
    return <div className="session-error">{error}</div>;
  }

  return (
    <motion.div 
      className="session-manager"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Active Sessions</h2>
      
      <div className="sessions-list">
        {sessions.map((session) => (
          <motion.div 
            key={session.id}
            className="session-card"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="session-info">
              <div className="device-icon">
                {getDeviceIcon(session.user_agent)}
              </div>
              <div className="session-details">
                <h3>{session.device_name || 'Unknown Device'}</h3>
                <p>Last Active: {formatDate(session.last_activity)}</p>
                <p>IP Address: {session.ip_address}</p>
              </div>
            </div>
            <motion.button
              className="logout-button"
              onClick={() => handleLogout(session.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTrash /> Logout
            </motion.button>
          </motion.div>
        ))}
      </div>

      <motion.button
        className="logout-all-button"
        onClick={handleLogoutAll}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Logout All Sessions
      </motion.button>

      <div className="session-stats">
        <h3>Session Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span>Active Sessions:</span>
            <span>{sessions.length}</span>
          </div>
          <div className="stat-item">
            <span>Last Refresh:</span>
            <span>{formatDate(getTokenUsage().lastRefresh)}</span>
          </div>
          <div className="stat-item">
            <span>Refresh Count:</span>
            <span>{getTokenUsage().refreshCount}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SessionManager; 