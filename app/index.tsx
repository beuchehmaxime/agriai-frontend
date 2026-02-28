import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../store/userStore';
import { initDatabase } from '../services/database';
import { Sprout } from 'lucide-react-native';

export default function Index() {
    const router = useRouter();
    const { loadUser, userId, isLoading } = useUserStore();

    useEffect(() => {
        const init = async () => {
            await initDatabase();
            await loadUser();
        };
        init();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                if (userId) {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/auth/welcome');
                }
            }, 10);

            return () => clearTimeout(timer);
        }
    }, [isLoading, userId]);

    return (
        <View className="flex-1 justify-center items-center bg-white">
            <View className="bg-primary/10 p-8 rounded-full mb-6">
                {/* Placeholder for Logo */}
                <View className="w-32 h-32 bg-primary/20 rounded-full items-center justify-center mb-6">
                    <Sprout color="#4ADE80" size={80} />
                </View>
                <Text className="text-4xl uppercase font-bold text-gray-900 text-center mb-2">Agri<Text className='text-primary'>AI</Text> </Text>
            </View>
            <ActivityIndicator size="large" color="#4ADE80" />
        </View>
    );
}
