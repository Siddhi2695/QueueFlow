import api from './api';
import { Manager } from '../types';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    manager: Manager;
    token: string;
  };
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', { name, email, password });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  async getMe(): Promise<{ success: boolean; data: { manager: Manager } }> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data: { name?: string; currentPassword?: string; newPassword?: string }): Promise<{ success: boolean; data: { manager: Manager } }> {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

