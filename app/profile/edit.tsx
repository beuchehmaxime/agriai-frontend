import { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useRouter } from 'expo-router';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { UserPen } from 'lucide-react-native';

export default function EditProfileScreen() {
    const { phoneNumber, setUser, userId, token, name, email, userType } = useUserStore();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: name || '',
        email: email || '',
    });
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!formData.name || !formData.email) {
            Alert.alert('Missing Fields', 'Please fill in name and email.');
            return;
        }

        setLoading(true);
        try {
            if (userId) {
                await setUser({
                    userId,
                    phoneNumber: phoneNumber || '',
                    token: token || '',
                    userType: userType as 'guest' | 'farmer',
                    name: formData.name,
                    email: formData.email
                });
                Alert.alert('Success', 'Profile updated successfully.');
                router.back();
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
                    <View className="mb-8">
                        <TouchableOpacity onPress={() => router.back()} className="mb-6">
                            <Text className="text-primary font-bold">Cancel</Text>
                        </TouchableOpacity>
                        <View className="bg-primary/10 w-16 h-16 rounded-full items-center justify-center mb-4">
                            <UserPen color="#4ADE80" size={32} />
                        </View>
                        <Text className="text-3xl font-bold text-gray-900">Edit Profile</Text>
                    </View>

                    <View className="space-y-4 gap-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />

                        <Input
                            label="Email Address"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View className="mt-10">
                        <Button
                            title="Save Changes"
                            onPress={handleUpdate}
                            loading={loading}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
