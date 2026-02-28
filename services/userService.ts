import { apiClient } from './apiClient';

export interface UserProfileUpdate {
    name?: string;
    email?: string;
}

export const UserService = {
    updateProfile: async (data: UserProfileUpdate): Promise<{ success: boolean; message: string; data: { user: any } }> => {
        const response = await apiClient.put<{ success: boolean; message: string; data: { user: any } }>('/user/profile', data);
        return response.data;
    }
};
