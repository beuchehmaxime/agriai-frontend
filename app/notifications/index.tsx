import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, Circle, CheckCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useNetwork } from '../../context/NetworkContext';
import IsOffline from '../../components/IsOffline';

export const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        title: 'Weather Alert: Heavy Rain Expected',
        message: 'High chances of heavy rainfall in Yaoundé tomorrow. Protect your young seedlings.',
        type: 'weather',
        date: '2 hours ago',
        read: false,
    },
    {
        id: '2',
        title: 'New Tip: Pest Control for Tomatoes',
        message: 'Check out our latest guide on managing blight in tomato plants naturally.',
        type: 'tip',
        date: '5 hours ago',
        read: true,
    },
    {
        id: '3',
        title: 'Diagnosis Complete',
        message: 'Your recent diagnosis for "Maize Disease" is ready for review.',
        type: 'diagnosis',
        date: 'Yesterday',
        read: true,
    },
    {
        id: '4',
        title: 'Community Update',
        message: 'New farmers have joined the AgriAI community in your region.',
        type: 'community',
        date: '2 days ago',
        read: true,
    }
];

export default function NotificationsScreen() {
    const router = useRouter();
    const { isConnected } = useNetwork();

    if (!isConnected) {
        return <IsOffline message="Please connect to the internet to view notifications." />;
    }

    const renderNotification = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: '/notifications/[id]', params: { id: item.id } })}
            className={`flex-row p-4 mb-2 rounded-2xl ${item.read ? 'bg-white' : 'bg-green-50/50 border border-green-100'}`}
        >
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${item.read ? 'bg-gray-100' : 'bg-primary/20'}`}>
                <Bell color={item.read ? '#9CA3AF' : '#4ADE80'} size={24} />
            </View>
            <View className="flex-1">
                <View className="flex-row justify-between items-start mb-1">
                    <Text className={`text-base flex-1 pr-2 ${item.read ? 'text-gray-700 font-medium' : 'text-gray-900 font-bold'}`}>
                        {item.title}
                    </Text>
                    {!item.read && <Circle size={10} color="#4ADE80" fill="#4ADE80" />}
                </View>
                <Text className="text-gray-500 text-sm mb-2" numberOfLines={2}>{item.message}</Text>
                <Text className="text-gray-400 text-xs">{item.date}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white p-4 border-b border-gray-100 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <ChevronLeft color="#374151" size={24} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Notifications</Text>
                </View>
                <TouchableOpacity className="flex-row items-center">
                    <CheckCheck color="#4ADE80" size={16} />
                    <Text className="text-primary text-xs font-bold ml-1">Mark all as read</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={MOCK_NOTIFICATIONS}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20">
                        <Bell color="#D1D5DB" size={64} />
                        <Text className="text-gray-400 mt-4">No notifications yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
