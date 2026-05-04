import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Strips the trailing /api segment to get the backend origin (e.g. http://localhost:8080)
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Converts a backend-relative path like /api/files/laws/foo.pdf to a usable URL.
 * In dev: returns the path as-is so Vite's proxy forwards it to the backend (same origin, no CORS).
 * In prod: returns an absolute URL using the configured backend origin.
 */
export function resolveFileUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (import.meta.env.DEV) return path;
  return `${API_ORIGIN}${path}`;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
      const errorMessage = error.response.data?.message || error.response.data?.error || 'An error occurred';
      console.error('API Error:', errorMessage);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

