import { View, Text, TouchableOpacity, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { useUserStore } from '../store/userStore';
import { LogOut, User as UserIcon, Settings, HelpCircle } from 'lucide-react-native';

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
    const router = useRouter();
    const { phoneNumber, userType, logout } = useUserStore();

    const handleLogout = async () => {
        await logout();
        router.replace('/auth/welcome');
    };

    return (
        <View className="flex-1">
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
                {/* Header */}
                <View className="p-6 bg-primary pt-16 items-start">
                    <View className="w-16 h-16 bg-white rounded-full items-center justify-center mb-3">
                        <UserIcon size={32} color="#4ADE80" />
                    </View>
                    <Text className="text-white text-lg font-bold">
                        {phoneNumber || 'Guest User'}
                    </Text>
                    <Text className="text-white/80 text-sm">
                        {userType === 'guest' ? 'Guest Access' : 'Registered User'}
                    </Text>
                </View>

                {/* Drawer Items (Tabs) */}
                <View className="flex-1 pt-4">
                    <DrawerItemList {...props} />
                </View>

                {/* Custom Quick Access / Footer Items could go here if not part of DrawerItemList */}
            </DrawerContentScrollView>

            {/* Footer */}
            <View className="p-4 border-t border-gray-200 pb-8">
                <TouchableOpacity className="flex-row items-center py-3" onPress={() => { }}>
                    <Settings size={22} color="#4B5563" />
                    <Text className="ml-3 text-gray-700 font-medium">Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center py-3" onPress={() => { }}>
                    <HelpCircle size={22} color="#4B5563" />
                    <Text className="ml-3 text-gray-700 font-medium">Help & Support</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center py-3 mt-4" onPress={handleLogout}>
                    <LogOut size={22} color="#EF4444" />
                    <Text className="ml-3 text-red-500 font-medium">Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
