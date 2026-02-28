import { apiClient } from './apiClient';
import { AuthResponse } from '../types';

export const AuthService = {
    login: async (phoneNumber: string, password: string): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', { phoneNumber, password });
        return response.data;
    },

    register: async (userData: { name: string; email: string; phoneNumber: string; password: string }): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register', userData);
        return response.data;
    }
};
