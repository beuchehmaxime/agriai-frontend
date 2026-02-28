import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../../components/Button';
import { LogOut, User, Settings, Shield, HelpCircle, Phone, UserPen, ChevronRight, RefreshCcw, Lock } from 'lucide-react-native';
import { useNetwork } from '../../context/NetworkContext';
import IsOffline from '../../components/IsOffline';
import { MenuItemProps } from '../../types';

export default function ProfileScreen() {
    const { phoneNumber, userType, logout, name, email, resetApp } = useUserStore();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isConnected } = useNetwork();

    if (!isConnected) {
        return <IsOffline message="Please connect to the internet to view your profile." />;
    }

    const handleReset = () => {
        Alert.alert(
            'Reset Application',
            'This will permanently delete all your data, including history and profile settings. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset Everything',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await resetApp();
                            router.replace('/auth/welcome');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reset application.');
                        }
                    }
                }
            ]
        );
    };


    if (userType === 'guest') {
        return (
            <SafeAreaView className="flex-1 bg-white p-6 justify-center items-center">
                <View className="bg-primary/10 p-8 rounded-full mb-8">
                    <Lock color="#4ADE80" size={64} />
                </View>
                <Text className="text-3xl font-black text-gray-900 text-center mb-4">Sign Up Required</Text>
                <Text className="text-gray-500 text-center text-lg mb-10 leading-6">
                    Please create an account to view and manage your profile settings.
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/auth/register')}
                    className="bg-primary w-full py-4 rounded-2xl shadow-lg shadow-green-200"
                >
                    <Text className="text-white text-center font-bold text-lg">Create Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={async () => {
                        await logout();
                        queryClient.clear();
                        router.replace('/auth/welcome');
                    }}
                    className="mt-4 p-4"
                >
                    <Text className="text-red-500 text-center font-bold">Log Out</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={async () => {
                        handleReset();
                    }}
                    className="mt-4 p-4"
                >
                    <Text className="text-red-500 text-center font-bold">Reset Application</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    queryClient.clear();
                    router.replace('/auth/welcome');
                }
            }
        ]);
    };

    const MenuItem = ({ icon: Icon, label, onPress, color = "#4B5563" }: MenuItemProps) => (
        <TouchableOpacity onPress={onPress} className="flex-row items-center gap-4 p-4 bg-white mb-2 rounded-2xl border border-gray-100">
            <View className="w-10 h-10 items-center justify-center rounded-xl bg-gray-50">
                <Icon color={color} size={24} />
            </View>
            <Text className="text-lg font-medium text-gray-700 flex-1">{label}</Text>
            <ChevronRight color="#9CA3AF" size={20} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                <View className='flex-row justify-between items-center mb-6'>
                    <Text className="text-3xl font-bold text-gray-900">Profile</Text>
                    {userType === 'farmer' && (
                        <TouchableOpacity
                            onPress={() => router.push('/profile/edit')}
                            className="bg-primary/10 p-2 rounded-full"
                        >
                            <UserPen color="#4ADE80" size={24} />
                        </TouchableOpacity>
                    )}
                </View>

                <View className="items-center mb-8 bg-gray-50 py-8 rounded-3xl border border-gray-100">
                    <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center mb-4 border-2 border-primary/10">
                        <User color="#4ADE80" size={48} />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">
                        {userType === 'farmer' ? (name || 'Farmer Profile') : 'Guest Account'}
                    </Text>
                    <Text className="text-gray-500 text-lg mb-1">{phoneNumber}</Text>
                    {email && <Text className="text-gray-400 text-sm mb-4">{email}</Text>}

                    <View className="mt-2 bg-green-100 px-4 py-1 rounded-full">
                        <Text className="text-primary font-bold text-xs uppercase tracking-wider">Verified Farmer</Text>
                    </View>
                </View>

                <View className="pt-2">
                    <Text className="text-sm font-bold text-gray-400 mb-4 ml-2 uppercase tracking-widest">Account Details</Text>
                    <MenuItem icon={Settings} label="Settings" onPress={() => { }} />
                    <MenuItem icon={Shield} label="Privacy Policy" onPress={() => { }} />
                    <MenuItem icon={HelpCircle} label="Help & Support" onPress={() => { }} />
                    {/* <MenuItem icon={RefreshCcw} label="Reset Application" onPress={handleReset} color="#F97316" /> */}
                    <MenuItem icon={LogOut} label="Logout" onPress={handleLogout} color="#EF4444" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
