import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { authStore } from '../stores/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = authStore.getState().token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = authStore.getState().refreshToken;
        
        if (refreshToken) {
          const response = await axios.post<{ token: string }>(
            `${API_BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken }
          );
          
          const { token } = response.data;
          authStore.getState().setToken(token);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        authStore.getState().logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper for handling errors
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || 'An error occurred',
      errors: error.response?.data?.errors,
      status: error.response?.status || 500,
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    status: 500,
  };
};

// API endpoints
export const authApi = {
  login: (credentials: LoginCredentials) => 
    api.post<AuthResponse>('/auth/login', credentials),
  
  register: (data: RegisterData) => 
    api.post<AuthResponse>('/auth/register', data),
  
  logout: () => api.post('/auth/logout'),
  
  getCurrentUser: () => api.get<User>('/auth/me'),
  
  updateProfile: (data: Partial<User>) => 
    api.put<User>('/auth/profile', data),
};

export const usersApi = {
  getAll: (params?: { page: number; limit: number; search?: string }) =>
    api.get<{ users: User[]; total: number; page: number }>('/users', { params }),
  
  getById: (id: number) => api.get<User>(`/users/${id}`),
  
  create: (data: Omit<User, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<User>('/users', data),
  
  update: (id: number, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data),
  
  delete: (id: number) => api.delete(`/users/${id}`),
};