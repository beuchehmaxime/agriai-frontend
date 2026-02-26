import { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useRouter } from 'expo-router';
import * as Network from 'expo-network';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Sprout, Lock, Globe } from 'lucide-react-native';
import api, { AuthService, getErrorMessage } from '../../services/api';
import { useNetwork } from '@/context/NetworkContext';
import IsOffline from '@/components/IsOffline';

export default function LoginScreen() {
    const { setUser } = useUserStore();
    const router = useRouter();

    const [formData, setFormData] = useState({
        phoneNumber: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        // 1. Validation
        if (!formData.phoneNumber || !formData.password) {
            Alert.alert('Missing Fields', 'Please enter both phone number and password.');
            return;
        }

        setLoading(true);

        try {
            // 2. Connectivity Check
            const networkState = await Network.getNetworkStateAsync();
            const isOnline = networkState.isConnected && networkState.isInternetReachable;

            if (!isOnline) {
                Alert.alert('Offline', 'You must be connected to the internet to login.');
                setLoading(false);
                return;
            }

            // 3. API Call
            console.log('Logging in:', formData.phoneNumber);

            const response = await AuthService.login(formData.phoneNumber, formData.password);

            if (!response.success) {
                throw new Error(response.message || 'Login failed');
            }

            const { user, token } = response.data;

            console.log('Login User Data:', user);

            // Normalize userType
            const normalizedUserType = (user.userType || '').toLowerCase();
            const validUserType = (normalizedUserType === 'farmer' || normalizedUserType === 'guest')
                ? normalizedUserType
                : 'guest';

            // 4. Update Store
            await setUser({
                userId: user.id, // Mapping id -> userId
                phoneNumber: user.phoneNumber,
                token: token,
                userType: validUserType as 'guest' | 'farmer',
                name: user.name,
                email: user.email
            });

            router.replace('/(tabs)');
        } catch (error: any) {
            console.error('Login Error:', error);

            const errorMessage = getErrorMessage(error);
            Alert.alert('Login Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const { isConnected } = useNetwork();

    if (!isConnected) {
        return <IsOffline message="Please connect to the internet to login." />;
    }
    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity onPress={() => router.back()} className="mb-6">
                        <Text className="text-primary font-bold">← Back</Text>
                    </TouchableOpacity>

                    <View className="items-center mb-8">
                        <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-4">
                            <Sprout color="#4ADE80" size={40} />
                        </View>
                        <Text className="text-3xl font-bold text-gray-900">Welcome Back</Text>
                        <Text className="text-gray-500 mt-2 text-center text-lg">
                            Login to access your farm dashboard.
                        </Text>
                    </View>

                    <View className="space-y-4 gap-4">
                        <Input
                            label="Phone Number"
                            placeholder="+237 600 000 000"
                            value={formData.phoneNumber}
                            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                            keyboardType="phone-pad"
                        />

                        <Input
                            label="Password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            secureTextEntry
                        />
                    </View>

                    <View className="mt-10 mb-6">
                        <View className="flex-row items-center mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <Globe size={18} color="#3B82F6" />
                            <Text className="text-blue-600 text-xs ml-2 font-medium">Internet connection required to login</Text>
                        </View>

                        <Button
                            title="Login"
                            onPress={handleLogin}
                            loading={loading}
                        />
                        <View className="flex-row justify-center mt-4">
                            <Text className="text-gray-500">Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/register')}>
                                <Text className="text-primary font-bold">Register</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
