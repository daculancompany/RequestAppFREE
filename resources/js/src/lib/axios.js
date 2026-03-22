import axios from "axios";
import { authStore } from "../stores/auth.store";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // const token = authStore.getState().token;
    const token = localStorage.getItem("adminpro_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = authStore.getState().refreshToken;

        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken }
          );

          const { token } = response.data;
          authStore.getState().setToken(token);

          originalRequest.headers =
            originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        authStore.getState().logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Helper for handling errors
export const handleApiError = (error) => {
  if (axios.isAxiosError(error)) {
    return {
      message:
        error.response?.data?.message || "An error occurred",
      errors: error.response?.data?.errors,
      status: error.response?.status || 500,
    };
  }

  return {
    message: "An unexpected error occurred",
    status: 500,
  };
};

// API endpoints
export const authApi = {
  login: (credentials) =>
    api.post("/auth/login", credentials),

  register: (data) =>
    api.post("/auth/register", data),

  logout: () => api.post("/auth/logout"),

  getCurrentUser: () => api.get("/auth/me"),

  updateProfile: (data) =>
    api.put("/auth/profile", data),
};

export const usersApi = {
  getAll: (params) =>
    api.get("/users", { params }),

  getById: (id) => api.get(`/users/${id}`),

  create: (data) =>
    api.post("/users", data),

  update: (id, data) =>
    api.put(`/users/${id}`, data),

  delete: (id) =>
    api.delete(`/users/${id}`),
};
