import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ✅ Interceptor to handle Refresh Token Logic
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Trigger refresh if we get 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // Attempt to get a new access token
          const res = await axios.post("http://localhost:5000/api/token/refresh", {
            refreshToken,
          });

          if (res.status === 200) {
            const { token } = res.data;
            localStorage.setItem("token", token);
            
            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          }
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          // If refresh fails, log out
        }
      }

      // If no refresh token or refresh failed, clear storage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("loggedInUser");
      if (!window.location.pathname.includes("/auth")) {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default API;