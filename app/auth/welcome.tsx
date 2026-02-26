import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../components/Button';
import { Sprout, WifiOff } from 'lucide-react-native';
import { useNetwork } from '../../context/NetworkContext';
import { useUserStore } from '../../store/userStore';

export default function Welcome() {
    const router = useRouter();
    const { isConnected, isInternetReachable } = useNetwork();
    const { setUser } = useUserStore();

    // Consider offline if not connected or not reachable (though reachable can be flaky, isConnected is safer for basic check)
    const isOffline = !isConnected;

    return (
        <View className="flex-1 bg-white p-6 justify-center">
            <View className="items-center mb-12">
                <View className="w-32 h-32 bg-primary/20 rounded-full items-center justify-center mb-6">
                    <Sprout color="#4ADE80" size={80} />
                </View>
                <Text className="text-4xl uppercase font-bold text-gray-900 text-center mb-2">Agri<Text className='text-primary'>AI</Text> </Text>
                <Text className="text-gray-500 text-center text-lg">
                    Your Intelligent Crop Disease Assistant
                </Text>
            </View>

            <View className="space-y-4 gap-4">
                {isOffline && (
                    <View className="bg-red-50 p-3 rounded-lg flex-row items-center justify-center space-x-2 gap-2 mb-2">
                        <WifiOff size={20} color="#EF4444" />
                        <Text className="text-red-500 font-medium text-center">
                            Please connect to the internet to login
                        </Text>
                    </View>
                )}

                <Button
                    title="Login"
                    className={isOffline ? 'opacity-50' : ''}
                    disabled={isOffline}
                    onPress={() => router.push('/auth/login')}
                />

                <Button
                    title="Continue as Guest"
                    variant='outline'
                    className='bg-white'
                    onPress={async () => {
                        const guestId = `guest_${Date.now()}`;
                        await setUser({
                            userId: guestId,
                            phoneNumber: '',
                            token: '',
                            userType: 'guest',
                            name: 'Guest',
                            email: ''
                        });
                        router.replace('/(tabs)');
                    }}
                />
            </View>
        </View>
    );
}
