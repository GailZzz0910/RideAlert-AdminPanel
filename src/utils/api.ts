import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://ridealert-backend.onrender.com",
  withCredentials: true,
});

// 🔑 Add WebSocket base URL (not part of axios, so export separately)
export const wsBaseURL =
  import.meta.env.VITE_WS_BASE_URL || "wss://ridealert-backend.onrender.com";

export const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL || "https://ridealert-backend.onrender.com";

// Add a request interceptor to add the token to all requests
api.interceptors.request.use(
  (config) => {
    // Check if we're in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear all auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Only redirect if we're not already on the landing page
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;