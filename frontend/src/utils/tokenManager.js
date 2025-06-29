import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

// Initialize fingerprint
let deviceFingerprint = null;
let tokenExpirationTimer = null;

// Analytics tracking
const tokenUsage = {
  lastRefresh: null,
  refreshCount: 0,
  failedAttempts: 0,
  deviceChanges: 0
};

export const getDeviceFingerprint = async () => {
  if (deviceFingerprint) return deviceFingerprint;
  
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  deviceFingerprint = result.visitorId;
  return deviceFingerprint;
};

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  
  // Set up expiration notification
  setupTokenExpirationNotification(accessToken);
  
  // Update analytics
  tokenUsage.lastRefresh = new Date();
  tokenUsage.refreshCount++;
  
  // Store analytics
  localStorage.setItem('token_usage', JSON.stringify(tokenUsage));
};

export const getTokens = () => ({
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token')
});

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  clearTokenExpirationTimer();
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

export const getTokenUsage = () => {
  const stored = localStorage.getItem('token_usage');
  return stored ? JSON.parse(stored) : tokenUsage;
};

export const setupTokenExpirationNotification = (token) => {
  clearTokenExpirationTimer();
  
  try {
    const decoded = jwtDecode(token);
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    
    // Notify 5 minutes before expiration
    const notificationTime = timeUntilExpiration - (5 * 60 * 1000);
    
    if (notificationTime > 0) {
      tokenExpirationTimer = setTimeout(() => {
        toast.warning('Your session will expire in 5 minutes. Please save your work.');
      }, notificationTime);
    }
  } catch (error) {
    console.error('Error setting up token expiration notification:', error);
  }
};

const clearTokenExpirationTimer = () => {
  if (tokenExpirationTimer) {
    clearTimeout(tokenExpirationTimer);
    tokenExpirationTimer = null;
  }
};

export const validateToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const trackFailedAttempt = () => {
  tokenUsage.failedAttempts++;
  localStorage.setItem('token_usage', JSON.stringify(tokenUsage));
};

export const trackDeviceChange = () => {
  tokenUsage.deviceChanges++;
  localStorage.setItem('token_usage', JSON.stringify(tokenUsage));
}; 