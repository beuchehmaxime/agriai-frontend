import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, Trash2, ArrowRight } from 'lucide-react-native';
import { MOCK_NOTIFICATIONS } from './index';

export default function NotificationDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const notification = MOCK_NOTIFICATIONS.find(n => n.id === id);

    if (!notification) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <Text>Notification not found.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <ChevronLeft color="#374151" size={24} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Notification Details</Text>
                </View>
                <TouchableOpacity className="p-2">
                    <Trash2 color="#EF4444" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-6">
                <View className="bg-primary/10 w-16 h-16 rounded-3xl items-center justify-center mb-6">
                    <Bell color="#4ADE80" size={32} />
                </View>

                <Text className="text-2xl font-black text-gray-900 mb-2 leading-tight">
                    {notification.title}
                </Text>

                <Text className="text-gray-400 text-sm mb-6">{notification.date}</Text>

                <View className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8">
                    <Text className="text-gray-700 text-lg leading-7">
                        {notification.message}
                    </Text>
                </View>

                {notification.type === 'tip' && (
                    <TouchableOpacity
                        onPress={() => router.push('/tips')}
                        className="flex-row items-center justify-between bg-white border border-primary/20 p-4 rounded-2xl"
                    >
                        <View className="flex-row items-center">
                            <View className="bg-primary/10 p-2 rounded-lg mr-3">
                                <ArrowRight color="#4ADE80" size={16} />
                            </View>
                            <Text className="text-primary font-bold">Read the full tip</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {notification.type === 'diagnosis' && (
                    <TouchableOpacity
                        onPress={() => router.push('/history')}
                        className="flex-row items-center justify-between bg-white border border-primary/20 p-4 rounded-2xl"
                    >
                        <View className="flex-row items-center">
                            <View className="bg-primary/10 p-2 rounded-lg mr-3">
                                <ArrowRight color="#4ADE80" size={16} />
                            </View>
                            <Text className="text-primary font-bold">View History</Text>
                        </View>
                    </TouchableOpacity>
                )}

                <View className="mt-12">
                    <Text className="text-gray-400 text-center text-xs">
                        Ref: NOTIF-{notification.id}-2024
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
