import axios from 'axios';

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
          const response = await apiClient.post("api/token/refresh/", {
            refresh: refreshToken
          });
          
          const { access, refresh } = response.data;
          localStorage.setItem("access_token", access);
          localStorage.setItem("refresh_token", refresh);

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

export default apiClient; 