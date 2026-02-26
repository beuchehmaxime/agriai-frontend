import { create } from 'zustand';
import { getUserSession, saveUserSection, getSavedPhone, saveSavedPhone, saveProfile, resetDatabase } from '../services/database';

interface UserState {
    userId: string | null;
    phoneNumber: string | null;
    token: string | null;
    userType: 'guest' | 'farmer' | null;
    isLoading: boolean;
    name: string | null;
    email: string | null;
    savedPhoneNumber: string | null;
    setUser: (user: { userId: string; phoneNumber: string; token?: string; userType: 'guest' | 'farmer'; name?: string | null; email?: string | null }) => void;
    loadUser: () => Promise<void>;
    logout: () => void;
    resetApp: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    userId: null,
    phoneNumber: null,
    token: null,
    userType: null,
    isLoading: true,
    name: null,
    email: null,
    savedPhoneNumber: null,

    setUser: async (user) => {
        set({ ...user, isLoading: false, savedPhoneNumber: user.phoneNumber });
        await saveUserSection(user.userId, user.phoneNumber, user.token || '', user.userType, user.name, user.email);
        await saveSavedPhone(user.phoneNumber);
        await saveProfile(user.phoneNumber, user.userId, user.token || '', user.userType, user.name, user.email);
    },

    loadUser: async () => {
        set({ isLoading: true });
        try {
            const user = await getUserSession();
            if (user) {
                set({
                    userId: user.userId,
                    phoneNumber: user.phoneNumber,
                    token: user.token,
                    userType: user.userType as 'guest' | 'farmer',
                    name: user.name,
                    email: user.email,
                    isLoading: false
                });
            }

            const savedPhone = await getSavedPhone();
            set({ savedPhoneNumber: savedPhone, isLoading: false });
        } catch (e) {
            console.error("Failed to load user", e);
            set({ isLoading: false });
        }
    },

    logout: async () => {
        set({ userId: null, phoneNumber: null, token: null, userType: null, name: null, email: null });
        // Clear from DB ideally
    },

    resetApp: async () => {
        set({ isLoading: true });
        try {
            await resetDatabase();
            set({
                userId: null,
                phoneNumber: null,
                token: null,
                userType: null,
                name: null,
                email: null,
                savedPhoneNumber: null,
                isLoading: false
            });
        } catch (error) {
            console.error("Failed to reset app", error);
            set({ isLoading: false });
            throw error;
        }
    }
}));
