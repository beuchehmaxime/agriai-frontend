export interface User {
    id: string;
    phoneNumber: string;
    email?: string | null;
    name?: string | null;
    userType: 'FARMER' | 'ADMIN' | 'AGRONOMIST' | 'guest';
    createdAt?: string;
    updatedAt?: string;
}

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

export interface Diagnosis {
    id: string;
    disease: string;
    confidence: number;
    advice: string;
    cropType: string;
    crop?: string; // Add optional crop
    symptoms?: string;
    imageUrl?: string;
    imageUri?: string; // Add optional imageUri for local compatibility
    createdAt?: string;
    image?: {
        id: string;
        url: string;
    };
}

export interface DiagnosisResponse {
    success: boolean;
    message: string;
    data: {
        diagnosis: Diagnosis;
    };
}

export interface DiagnosisLocal {
    id: number;
    diagnosisId: string;
    crop: string;
    disease: string;
    confidence: number;
    advice: string;
    imageUri: string;
    synced: number;
    createdAt: string;
}

export interface RootStackParamList {
    [key: string]: any; // Allow easy navigation usage, or define strictly.
}

export interface QuickAccessItemProps {
    icon: React.ElementType;
    label: string;
    color: string;
    onPress: () => void;
}

export interface MenuItemProps {
    icon: React.ElementType;
    label: string;
    onPress: () => void;
    color?: string;
}
