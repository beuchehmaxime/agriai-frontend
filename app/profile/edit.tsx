import { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useRouter } from 'expo-router';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { UserPen } from 'lucide-react-native';
import { useUpdateProfile } from '../../hooks/useUser';
import FullScreenLoader from '../../components/FullScreenLoader';

export default function EditProfileScreen() {
    const { phoneNumber, setUser, userId, token, name, email, userType } = useUserStore();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: name || '',
        email: email || '',
    });
    const { mutate: updateProfile, isPending: loading } = useUpdateProfile();

    const handleUpdate = () => {
        if (!formData.name && !formData.email) {
            Alert.alert('Missing Fields', 'Please fill in at least a name or email.');
            return;
        }

        updateProfile(formData);
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
                            disabled={loading}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <FullScreenLoader visible={loading} message="Saving Profile..." />
        </SafeAreaView>
    );
}
