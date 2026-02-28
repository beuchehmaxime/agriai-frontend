// services/apiClient.ts
import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useUserStore } from '../store/userStore';

const getBaseUrl = () => {
    // Priority 1: Automated host detection from Expo (Works for Expo Go)
    const hostUri = Constants.expoConfig?.hostUri;
    const manifestHost = hostUri?.split(':').shift();

    if (manifestHost) {
        return `http://${manifestHost}:3000/api`;
    }

    // Priority 2: Hardcoded fallback (Local machine IP)
    const FALLBACK_IP = '192.168.1.129';

    if (Platform.OS === 'android') {
        // 10.0.2.2 is the host machine when using Android Emulator
        return `http://10.0.2.2:3000/api`;
    }

    return `http://${FALLBACK_IP}:3000/api`;
};

const BASE_URL = getBaseUrl();
console.log('[API] >>> ACTIVE BASE_URL:', BASE_URL);

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    console.log(`[API Request Attempt] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

    const token = useUserStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
    (response) => {
        console.log(`[API Response Success] ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error) => {
        const errorMessage = getErrorMessage(error);
        if (error.code === 'ECONNABORTED') {
            console.error('[API Error] Request timed out');
        } else if (!error.response) {
            console.error('[API Error] Network Error - Is the server running and reachable at', BASE_URL);
            console.error('[API Error Detail]', errorMessage);
        } else {
            console.error(`[API Error] ${error.response.status} ${error.config.url}:`, error.response.data);
        }
        return Promise.reject(error);
    }
);

/**
 * Extracts a human-readable error message from an Axios error object.
 */
export const getErrorMessage = (error: unknown): string => {
    const axiosError = error as any;

    if (axiosError && axiosError.response && axiosError.response.data) {
        const data = axiosError.response.data;
        if (typeof data.error === 'string') return data.error;
        if (typeof data.message === 'string') return data.message;
        if (typeof data === 'string') return data;
    }

    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred. Please try again.';
};
