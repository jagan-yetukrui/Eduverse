import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Profile Service - Handles all profile-related API calls
 */
export const profileService = {
  /**
   * Fetch user's complete profile
   */
  async getProfile() {
    try {
      const response = await api.get('/api/profiles/me/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch profile');
    }
  },

  /**
   * Update basic profile information
   * @param {Object} profileData - Profile data to update
   * @param {File} profileImage - Optional profile image file
   */
  async updateProfile(profileData, profileImage = null) {
    try {
      const formData = new FormData();
      
      // Add basic profile fields
      Object.keys(profileData).forEach(key => {
        if (key !== 'profile_image' && key !== 'skills') {
          if (typeof profileData[key] === 'object') {
            formData.append(key, JSON.stringify(profileData[key]));
          } else {
            formData.append(key, profileData[key] || '');
          }
        }
      });

      // Add profile image if provided
      if (profileImage) {
        formData.append('profile_image', profileImage);
      }

      const response = await api.patch('/api/profiles/me/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update profile');
    }
  },

  /**
   * Get profile statistics
   */
  async getProfileStats() {
    try {
      const response = await api.get('/api/profiles/me/stats/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch profile stats');
    }
  },

  // Education Management
  async getEducation() {
    try {
      const response = await api.get('/api/profiles/me/education/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch education');
    }
  },

  async addEducation(educationData) {
    try {
      const response = await api.post('/api/profiles/me/education/', educationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to add education');
    }
  },

  async updateEducation(id, educationData) {
    try {
      const response = await api.put(`/api/profiles/me/education/${id}/`, educationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update education');
    }
  },

  async deleteEducation(id) {
    try {
      await api.delete(`/api/profiles/me/education/${id}/`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete education');
    }
  },

  // Experience Management
  async getExperience() {
    try {
      const response = await api.get('/api/profiles/me/experience/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch experience');
    }
  },

  async addExperience(experienceData) {
    try {
      const response = await api.post('/api/profiles/me/experience/', experienceData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to add experience');
    }
  },

  async updateExperience(id, experienceData) {
    try {
      const response = await api.put(`/api/profiles/me/experience/${id}/`, experienceData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update experience');
    }
  },

  async deleteExperience(id) {
    try {
      await api.delete(`/api/profiles/me/experience/${id}/`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete experience');
    }
  },

  // License Management
  async getLicenses() {
    try {
      const response = await api.get('/api/profiles/me/licenses/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch licenses');
    }
  },

  async addLicense(licenseData) {
    try {
      const response = await api.post('/api/profiles/me/licenses/', licenseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to add license');
    }
  },

  async updateLicense(id, licenseData) {
    try {
      const response = await api.put(`/api/profiles/me/licenses/${id}/`, licenseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update license');
    }
  },

  async deleteLicense(id) {
    try {
      await api.delete(`/api/profiles/me/licenses/${id}/`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete license');
    }
  },

  // Project Management
  async getProjects() {
    try {
      const response = await api.get('/api/profiles/me/projects/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch projects');
    }
  },

  async addProject(projectData, projectImage = null) {
    try {
      const formData = new FormData();
      
      // Add basic project fields
      Object.keys(projectData).forEach(key => {
        if (key !== 'project_image' && key !== 'technologies' && key !== 'end_date') {
          if (typeof projectData[key] === 'object') {
            formData.append(key, JSON.stringify(projectData[key]));
          } else {
            formData.append(key, projectData[key] || '');
          }
        }
      });

      // Handle end_date properly - don't send "null" string
      if (projectData.end_date && projectData.end_date !== "null" && projectData.end_date !== "") {
        formData.append('end_date', projectData.end_date);
      }
      // If end_date is null, empty, or "null", don't append it (backend will use default)

      // Add technologies as JSON string if it's an array
      if (projectData.technologies) {
        if (Array.isArray(projectData.technologies)) {
          formData.append('technologies', JSON.stringify(projectData.technologies));
        } else {
          formData.append('technologies', projectData.technologies);
        }
      }

      // Add project image if provided
      if (projectImage) {
        formData.append('project_image', projectImage);
      }

      const response = await api.post('/api/profiles/me/projects/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to add project');
    }
  },

  async updateProject(id, projectData, projectImage = null) {
    try {
      const formData = new FormData();
      
      // Add basic project fields
      Object.keys(projectData).forEach(key => {
        if (key !== 'project_image' && key !== 'technologies' && key !== 'end_date') {
          if (typeof projectData[key] === 'object') {
            formData.append(key, JSON.stringify(projectData[key]));
          } else {
            formData.append(key, projectData[key] || '');
          }
        }
      });

      // Handle end_date properly - don't send "null" string
      if (projectData.end_date && projectData.end_date !== "null" && projectData.end_date !== "") {
        formData.append('end_date', projectData.end_date);
      }
      // If end_date is null, empty, or "null", don't append it (backend will use default)

      // Add technologies as JSON string if it's an array
      if (projectData.technologies) {
        if (Array.isArray(projectData.technologies)) {
          formData.append('technologies', JSON.stringify(projectData.technologies));
        } else {
          formData.append('technologies', projectData.technologies);
        }
      }

      // Add project image if provided
      if (projectImage) {
        formData.append('project_image', projectImage);
      }

      const response = await api.patch(`/api/profiles/me/projects/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update project');
    }
  },

  async deleteProject(id) {
    try {
      await api.delete(`/api/profiles/me/projects/${id}/`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete project');
    }
  },
};

/**
 * Validation utilities
 */
export const validationUtils = {
  /**
   * Validate date range (end date should be after start date)
   */
  validateDateRange(startDate, endDate) {
    if (!startDate || !endDate) return true;
    return new Date(endDate) >= new Date(startDate);
  },

  /**
   * Validate required fields
   */
  validateRequired(fields, data) {
    const errors = {};
    fields.forEach(field => {
      if (!data[field] || data[field].toString().trim() === '') {
        errors[field] = `${field.replace('_', ' ')} is required`;
      }
    });
    return errors;
  },

  /**
   * Validate file upload
   */
  validateFile(file, maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']) {
    if (!file) return null;
    
    if (file.size > maxSize) {
      return 'File size must be under 5MB';
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and GIF images are allowed';
    }
    
    return null;
  },
};

/**
 * File handling utilities
 */
export const fileUtils = {
  /**
   * Create preview URL for image file
   */
  createImagePreview(file) {
    return URL.createObjectURL(file);
  },

  /**
   * Clean up preview URL
   */
  cleanupPreview(url) {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  },

  /**
   * Convert file to base64 (for preview)
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  },
};

export default profileService; 