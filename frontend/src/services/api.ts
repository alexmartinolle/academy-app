import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      // Forbidden - show error message
      console.error('❌ Access forbidden');
    }
    
    if (error.response?.status >= 500) {
      // Server error
      console.error('❌ Server error:', error.response.data);
    }
    
    console.error('❌ Response Error:', error);
    return Promise.reject(error);
  }
);

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination response type
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API methods
export const apiClient = {
  // GET request
  get: async <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
    const response = await api.get<ApiResponse<T>>(url, { params });
    return response.data;
  },
  
  // POST request
  post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await api.post<ApiResponse<T>>(url, data);
    return response.data;
  },
  
  // PUT request
  put: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await api.put<ApiResponse<T>>(url, data);
    return response.data;
  },
  
  // DELETE request
  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await api.delete<ApiResponse<T>>(url);
    return response.data;
  },
  
  // GET paginated request
  getPaginated: async <T>(url: string, params?: any): Promise<PaginatedResponse<T>> => {
    const response = await api.get<PaginatedResponse<T>>(url, { params });
    return response.data;
  },
};

export default apiClient;
