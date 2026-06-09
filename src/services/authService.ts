import apiClient from '@/lib/apiClient';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  CurrentUser,
  ChangePasswordRequest
} from '@/types/api';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    const loginData = response.data.data!;

    localStorage.setItem('auth_token', loginData.token);
    localStorage.setItem('auth_user', JSON.stringify(loginData));

    return loginData;
  },

  async register(data: RegisterRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', data);
    return response.data.data!;
  },

  async getCurrentUser(): Promise<CurrentUser> {
    const response = await apiClient.get<ApiResponse<CurrentUser>>('/auth/me');
    return response.data.data!;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return response.data.data!;
  },

  async updateProfile(data: { fullName?: string; organization?: string; position?: string }): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
    return response.data.data!;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post<ApiResponse<string>>('/auth/change-password', data);
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post<ApiResponse<string>>('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  getStoredUser(): LoginResponse | null {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('auth_user');
    if (!token || !userJson) return null;
    if (this.isTokenExpired(token)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      return null;
    }
    return JSON.parse(userJson);
  },

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    return !!token && !this.isTokenExpired(token);
  },

  hasRole(role: string): boolean {
    const user = this.getStoredUser();
    return user?.roles?.includes(role) || false;
  },

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  },
};

