import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// 1. Determine BASE_URL dynamically for development
const getBaseUrl = () => {
    // Priority 1: Automated host detection from Expo (Works for Expo Go)
    const hostUri = Constants.expoConfig?.hostUri;
    const manifestHost = hostUri?.split(':').shift();

    console.log('[API Debug] hostUri:', hostUri);
    console.log('[API Debug] manifestHost:', manifestHost);

    if (manifestHost) {
        return `http://${manifestHost}:3000/api`;
    }

    // Priority 2: Hardcoded fallback (Local machine IP)
    const FALLBACK_IP = '192.168.1.129';

    if (Platform.OS === 'android') {
        // 10.0.2.2 is the host machine when using Android Emulator
        console.log('[API Debug] Detected Android Emulator, using 10.0.2.2');
        return `http://10.0.2.2:3000/api`;
    }

    console.log('[API Debug] Using Fallback IP:', FALLBACK_IP);
    return `http://${FALLBACK_IP}:3000/api`;
};

const BASE_URL = getBaseUrl();
console.log('[API] >>> ACTIVE BASE_URL:', BASE_URL);

const api = axios.create({
    baseURL: BASE_URL,
    // timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

import { useUserStore } from '../store/userStore';

// 2. Add Request Interceptor for Logging & Auth
api.interceptors.request.use((config) => {
    console.log(`[API Request Attempt] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

    const token = useUserStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// 3. Add Response Interceptor for Error Logging
api.interceptors.response.use(
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
 * Handles different backend error formats (e.g., {error: "msg"} or {message: "msg"}).
 */
export const getErrorMessage = (error: any): string => {
    if (error.response?.data) {
        const data = error.response.data;
        // Priority 1: Backend 'error' field (current backend behavior)
        if (typeof data.error === 'string') return data.error;
        // Priority 2: Backend 'message' field (standard axios/common behavior)
        if (typeof data.message === 'string') return data.message;
        // Priority 3: Fallback to generic message if data is just a string
        if (typeof data === 'string') return data;
    }

    // Fallback to standard error message
    return error.message || 'An unexpected error occurred. Please try again.';
};

export default api;

// --- Auth Service ---

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    userType: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: UserResponse;
        token: string;
    };
}

export const AuthService = {
    login: async (phoneNumber: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', { phoneNumber, password });
        return response.data;
    },

    register: async (userData: { name: string; email: string; phoneNumber: string; password: string }): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', userData);
        return response.data;
    }
};

// --- Diagnosis Service ---

export interface Diagnosis {
    id: string;
    disease: string;
    confidence: number;
    advice: string;
    cropType: string;
    symptoms?: string;
    imageUrl?: string;
    createdAt?: string;
}

export interface DiagnosisResponse {
    success: boolean;
    message: string;
    data: {
        diagnosis: Diagnosis;
    };
}

export const DiagnosisService = {
    predict: async (formData: FormData): Promise<DiagnosisResponse> => {
        const response = await api.post<DiagnosisResponse>('/diagnosis/predict', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getHistory: async (): Promise<{ success: boolean; data: Diagnosis[] }> => {
        const response = await api.get<{ success: boolean; data: Diagnosis[] }>('/diagnosis/history');
        return response.data;
    }
};
