import { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useRouter } from 'expo-router';
import * as Network from 'expo-network';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { UserPlus, ShieldCheck, Globe } from 'lucide-react-native';
import api, { AuthService, getErrorMessage } from '../../services/api';
import { useNetwork } from '@/context/NetworkContext';
import IsOffline from '@/components/IsOffline';

export default function RegisterScreen() {
    const { setUser } = useUserStore();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        // 1. Validation
        if (!formData.name || !formData.email || !formData.password || !formData.phoneNumber) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            // 2. Connectivity Check
            const networkState = await Network.getNetworkStateAsync();
            const isOnline = networkState.isConnected && networkState.isInternetReachable;

            if (!isOnline) {
                Alert.alert('Offline', 'You must be connected to the internet to create an account.');
                setLoading(false);
                return;
            }

            // 3. API Call
            console.log('Registering account for:', formData.phoneNumber);

            const response = await AuthService.register({
                phoneNumber: formData.phoneNumber,
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            console.log('Register Response:', response);

            if (!response.success) {
                throw new Error(response.message || 'Registration failed');
            }

            const { user, token } = response.data;

            console.log('Register User Data:', user);

            // Normalize userType
            const normalizedUserType = (user.userType || '').toLowerCase();
            const validUserType = (normalizedUserType === 'farmer' || normalizedUserType === 'guest')
                ? normalizedUserType
                : 'guest';

            // 4. Update Store & Local DB
            await setUser({
                userId: user.id, // Mapping id -> userId
                phoneNumber: user.phoneNumber,
                token: token,
                userType: validUserType as 'guest' | 'farmer',
                name: user.name,
                email: user.email
            });

            Alert.alert('Success 🎉', 'Your account has been created!');
            router.replace('/(tabs)');
        } catch (error: any) {
            console.error('Registration Error:', error);

            const errorMessage = getErrorMessage(error);
            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };
    const { isConnected } = useNetwork();

    if (!isConnected) {
        return <IsOffline message="Please connect to the internet to register." />;
    }
    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }} showsVerticalScrollIndicator={false}>
                    <View className="mb-8">
                        <TouchableOpacity onPress={() => router.back()} className="mb-6">
                            <Text className="text-primary font-bold">← Back</Text>
                        </TouchableOpacity>
                        <View className="bg-primary/10 w-16 h-16 rounded-2xl items-center justify-center mb-4">
                            <UserPlus color="#4ADE80" size={32} />
                        </View>
                        <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
                        <Text className="text-gray-500 mt-2 text-lg">
                            Complete your profile to unlock all community features.
                        </Text>
                    </View>

                    <View className="space-y-4 gap-3">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />

                        <Input
                            label="Phone Number"
                            placeholder="+237 600 000 000"
                            value={formData.phoneNumber}
                            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                            keyboardType="phone-pad"
                        />

                        <Input
                            label="Email Address"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Input
                            label="Password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            secureTextEntry
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                            secureTextEntry
                        />
                    </View>

                    <View className="mt-3 mb-6">
                        {/* <View className="flex-row items-center mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <Globe size={18} color="#3B82F6" />
                            <Text className="text-blue-600 text-xs ml-2 font-medium">Internet connection required for registration</Text>
                        </View> */}

                        <Button
                            title="Register"
                            onPress={handleRegister}
                            loading={loading}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
