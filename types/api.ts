export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export interface NewUser {
    phoneNumber: string;
    userType: string; // e.g., "FARMER" or "GUEST"
    id?: string; // It's better if backend returns this, otherwise we might need to decode token
}

export interface AuthData {
    newUser: NewUser;
    token: string;
}

export type AuthResponse = ApiResponse<AuthData>;
