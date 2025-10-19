// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL,
//   withCredentials: true,
// });

// // 🔑 Add WebSocket base URL (not part of axios, so export separately)
// export const wsBaseURL =
//   import.meta.env.VITE_WS_BASE_URL;

// export const apiBaseURL =
//   import.meta.env.VITE_API_BASE_URL;

// // Add a request interceptor to add the token to all requests
// api.interceptors.request.use(
//   (config) => {
//     // Check if we're in the browser before accessing localStorage
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem("token");
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor for handling token expiration
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Token expired or invalid - clear all auth data
//       if (typeof window !== 'undefined') {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         // Only redirect if we're not already on the landing page
//         if (window.location.pathname !== '/') {
//           window.location.href = '/';
//         }
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export const wsBaseURL = import.meta.env.VITE_WS_BASE_URL;
export const apiBaseURL = import.meta.env.VITE_API_BASE_URL;

// ===== Add token on all requests =====
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Token Refresh Logic =====
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        // No refresh token - force logout
        console.warn("No refresh token available - logging out");
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue other requests while token is being refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      isRefreshing = true;
      try {
        console.log("Attempting to refresh token...");
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/fleets/refresh`,
          { refresh_token: refreshToken },
          { withCredentials: true }
        );

        const newAccessToken = data.access_token;
        localStorage.setItem("token", newAccessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return api(originalRequest); // Retry failed request with new token
      } catch (err) {
        console.error("Token refresh failed - logging out");
        processQueue(err, null);
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;