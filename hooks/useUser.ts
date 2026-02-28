import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Network from 'expo-network';
import { UserService, UserProfileUpdate } from '../services/userService';
import { useUserStore } from '../store/userStore';
import { getErrorMessage } from '../services/apiClient';

export const useUpdateProfile = () => {
    const { setUser } = useUserStore();
    const router = useRouter();

    return useMutation({
        mutationFn: async (data: UserProfileUpdate) => {
            const networkState = await Network.getNetworkStateAsync();
            const isOnline = networkState.isConnected && networkState.isInternetReachable;

            if (!isOnline) {
                throw new Error('OFFLINE');
            }

            const response = await UserService.updateProfile(data);
            if (!response.success && !response.data?.user) {
                // Adjusting checks based on standard response formats
                throw new Error(response.message || 'Failed to update profile');
            }
            return response.data?.user || response.data || response;
        },
        onSuccess: async (updatedUser) => {
            // UpdatedUser could be nested under data or data.user depending on the standard utility response format.
            // We use the safe payload to merge into out local Zustand store
            const store = useUserStore.getState();

            await setUser({
                userId: store.userId || updatedUser.id,
                phoneNumber: store.phoneNumber || updatedUser.phoneNumber,
                token: store.token || '', // Token doesn't change on profile update
                userType: store.userType || updatedUser.userType || 'guest',
                name: updatedUser.name || store.name,
                email: updatedUser.email || store.email
            });

            Alert.alert('Success', 'Profile updated successfully.');
            router.back();
        },
        onError: (error: any) => {
            if (error.message === 'OFFLINE') {
                Alert.alert('Offline', 'You must be connected to the internet to update your profile.');
            } else {
                const errorMessage = getErrorMessage(error);
                Alert.alert('Update Failed', errorMessage);
            }
        }
    });
};
