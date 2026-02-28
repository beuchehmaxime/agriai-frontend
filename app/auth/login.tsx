import { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useRouter } from 'expo-router';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Sprout, Globe } from 'lucide-react-native';
import { useNetwork } from '@/context/NetworkContext';
import IsOffline from '@/components/IsOffline';
import { useLogin } from '@/hooks/useAuth';
import FullScreenLoader from '@/components/FullScreenLoader';

export default function LoginScreen() {
    const router = useRouter();
    const { mutate: login, isPending: loading } = useLogin();

    const [formData, setFormData] = useState({
        phoneNumber: '',
        password: ''
    });

    const handleLogin = () => {
        // 1. Validation
        if (!formData.phoneNumber || !formData.password) {
            Alert.alert('Missing Fields', 'Please enter both phone number and password.');
            return;
        }

        login({ phoneNumber: formData.phoneNumber, password: formData.password });
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
                            disabled={loading}
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
            <FullScreenLoader visible={loading} message="Signing in..." />
        </SafeAreaView>
    );
}
