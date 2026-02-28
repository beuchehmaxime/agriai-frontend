import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Network from 'expo-network';
import { AuthService } from '../services/authService';
import { useUserStore } from '../store/userStore';
import { getErrorMessage } from '../services/apiClient';
import { useNetwork } from '../context/NetworkContext';

export const useLogin = () => {
    const { setUser } = useUserStore();
    const router = useRouter();

    return useMutation({
        mutationFn: async (credentials: { phoneNumber: string; password: string }) => {
            const networkState = await Network.getNetworkStateAsync();
            const isOnline = networkState.isConnected && networkState.isInternetReachable;

            if (!isOnline) {
                throw new Error('OFFLINE');
            }

            const response = await AuthService.login(credentials.phoneNumber, credentials.password);
            if (!response.success) {
                throw new Error(response.message || 'Login failed');
            }

            return response.data;
        },
        onSuccess: async (data) => {
            const { user, token } = data;

            const normalizedUserType = (user.userType || '').toLowerCase();
            const validUserType = (normalizedUserType === 'farmer' || normalizedUserType === 'guest')
                ? normalizedUserType
                : 'guest';

            await setUser({
                userId: user.id,
                phoneNumber: user.phoneNumber,
                token: token,
                userType: validUserType as 'guest' | 'farmer',
                name: user.name,
                email: user.email
            });

            router.replace('/(tabs)');
        },
        onError: (error: any) => {
            if (error.message === 'OFFLINE') {
                Alert.alert('Offline', 'You must be connected to the internet to login.');
            } else {
                const errorMessage = getErrorMessage(error);
                Alert.alert('Login Failed', errorMessage);
            }
        }
    });
};

export const useRegister = () => {
    const { setUser } = useUserStore();
    const router = useRouter();

    return useMutation({
        mutationFn: async (userData: { name: string; email: string; phoneNumber: string; password: string; confirmPassword?: string }) => {
            const networkState = await Network.getNetworkStateAsync();
            const isOnline = networkState.isConnected && networkState.isInternetReachable;

            if (!isOnline) {
                throw new Error('OFFLINE');
            }

            // Strip out confirmPassword before sending to API
            const { confirmPassword, ...payload } = userData;

            const response = await AuthService.register(payload);
            if (!response.success) {
                throw new Error(response.message || 'Registration failed');
            }
            return response.data;
        },
        onSuccess: async (data) => {
            const { user, token } = data;

            const normalizedUserType = (user.userType || '').toLowerCase();
            const validUserType = (normalizedUserType === 'farmer' || normalizedUserType === 'guest')
                ? normalizedUserType
                : 'guest';

            await setUser({
                userId: user.id,
                phoneNumber: user.phoneNumber,
                token: token,
                userType: validUserType as 'guest' | 'farmer',
                name: user.name,
                email: user.email
            });

            Alert.alert('Success 🎉', 'Your account has been created!');
            router.replace('/(tabs)');
        },
        onError: (error: any) => {
            if (error.message === 'OFFLINE') {
                Alert.alert('Offline', 'You must be connected to the internet to create an account.');
            } else {
                const errorMessage = getErrorMessage(error);
                Alert.alert('Registration Failed', errorMessage);
            }
        }
    });
};
