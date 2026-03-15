import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useRouter, useFocusEffect } from 'expo-router';
import { User, MessageSquare } from 'lucide-react-native';
import { ConsultationService } from '../../services/consultationService';
import { useCallback } from 'react';

export default function ConsultScreen() {
    const { userType, token, userId: currentUserId } = useUserStore();
    const router = useRouter();

    // For farmers: 'new' means connect to new agronomists, 'active' means ongoing chats
    // For agronomists: 'requests' means new farmer connection requests, 'active' means connected farmers
    const [activeTab, setActiveTab] = useState<'tab1' | 'tab2'>('tab1');
    const [agronomists, setAgronomists] = useState<any[]>([]);
    const [consultations, setConsultations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [userType, activeTab])
    );

    const fetchData = async () => {
        setLoading(true);
        try {
            if (userType === 'Farmer') {
                const [agroRes, consRes] = await Promise.all([
                    ConsultationService.getAgronomists().catch(() => ({ success: false, data: [] })),
                    ConsultationService.getMyConsultations().catch(() => ({ success: false, data: [] }))
                ]);

                if (consRes?.success) {
                    setConsultations(consRes.data);
                }

                if (agroRes?.success && consRes?.success) {
                    const activeAgroIds = new Set((consRes.data || []).map((c: any) => c.agronomistId));
                    const filtered = (agroRes.data || []).filter((a: any) => !activeAgroIds.has(a.id));
                    const sorted = filtered.sort((a: any, b: any) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0));
                    setAgronomists(sorted);
                }
            } else if (userType === 'Agronomist') {
                const consRes = await ConsultationService.getMyConsultations().catch(() => ({ success: false, data: [] }));
                if (consRes?.success) {
                    setConsultations(consRes.data);
                }
            }
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    const startConsultation = async (agronomistId: string) => {
        setLoading(true);
        try {
            const res = await ConsultationService.createConsultation(agronomistId);
            if (res?.success) {
                const agronomistName = agronomists.find(a => a.id === agronomistId)?.name || 'Agronomist';
                router.push({ pathname: '/consult/[id]', params: { id: res.data.id, name: agronomistName } } as any);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error('Failed to start consultation', err);
            setLoading(false);
        }
    };

    const handleAgronomistPress = (item: any) => {
        router.push({ 
            pathname: '/consult/agronomist/[id]' as any, 
            params: { id: item.id, name: item.name || 'Agronomist' } 
        });
    };

    const renderAgronomist = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => handleAgronomistPress(item)}
            className="bg-white p-4 rounded-2xl mb-4 shadow-sm border border-gray-100 flex-row items-center"
        >
            <View className="relative w-14 h-14 bg-gray-100 rounded-full items-center justify-center mr-4">
                <User color="#9CA3AF" size={24} />
                <View className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${item.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            </View>
            <View className="flex-1 justify-center">
                <Text className="text-lg font-bold text-gray-800">{item.name || 'Agronomist'}</Text>
                <View className="mt-1">
                    <Text className="text-gray-500 text-sm">{item.isOnline ? 'Online now' : 'Offline'}</Text>
                </View>
            </View>
            <View className="bg-primary/10 px-4 py-2 rounded-full">
                <Text className="text-primary font-bold">View Profile</Text>
            </View>
        </TouchableOpacity>
    );

    const renderActiveChat = ({ item }: { item: any }) => {
        const otherUser = userType === 'Farmer' ? item.agronomist : item.farmer;
        const name = otherUser?.user?.name || otherUser?.name || 'Unknown User';
        const isOnline = otherUser?.user?.isOnline || otherUser?.isOnline || false;

        return (
            <TouchableOpacity
                onPress={() => router.push({ pathname: '/consult/[id]', params: { id: item.id, name: name } } as any)}
                className="bg-white p-4 rounded-2xl mb-4 shadow-sm border border-gray-100 flex-row items-center"
            >
                <View className="relative w-14 h-14 bg-gray-100 rounded-full items-center justify-center mr-4">
                    <User color="#9CA3AF" size={24} />
                    <View className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                </View>
                <View className="flex-1 justify-center">
                    <Text className="text-lg font-bold text-gray-800">{name}</Text>
                    <View className="mt-1">
                        <Text className="text-gray-500 text-sm">{isOnline ? 'Online now' : 'Offline'}</Text>
                    </View>
                </View>
                <View className="bg-primary/10 px-4 py-2 rounded-full">
                    <Text className="text-primary font-bold">Chat</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderTabContent = () => {
        if (loading) return <ActivityIndicator color="#4ADE80" style={{ marginTop: 40 }} />;

        if (userType === 'Farmer') {
            if (activeTab === 'tab1') {
                return (
                    <FlatList
                        data={agronomists}
                        renderItem={renderAgronomist}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        ListEmptyComponent={
                            <View className="mt-10 items-center">
                                <Text className="text-center text-gray-500">No agronomists available</Text>
                            </View>
                        }
                    />
                );
            } else {
                return (
                    <FlatList
                        data={consultations}
                        renderItem={renderActiveChat}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        ListEmptyComponent={
                            <View className="mt-10 items-center">
                                <Text className="text-center text-gray-500">No active conversations yet.</Text>
                            </View>
                        }
                    />
                );
            }
        } else {
            // Agronomist view
            return (
                <FlatList
                    data={consultations}
                    renderItem={renderActiveChat}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="mt-10 items-center">
                            <Text className="text-center text-gray-500">Connected farmers will appear here.</Text>
                        </View>
                    }
                />
            );
        }
    };

    const tab1Label = userType === 'Farmer' ? 'New Agronomists' : 'Connection Requests';
    const tab2Label = userType === 'Farmer' ? 'Active Chats' : 'Connected Farmers';

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 py-6 bg-white border-b border-gray-100">
                <View className={userType === 'Farmer' ? 'mb-6' : 'mb-2'}>
                    <Text className="text-2xl font-black text-gray-900">Consultation</Text>
                </View>

                {userType === 'Farmer' && (
                    <View className="flex-row bg-gray-100 p-1 rounded-xl">
                        <TouchableOpacity
                            onPress={() => setActiveTab('tab1')}
                            className={`flex-1 py-3 items-center rounded-lg ${activeTab === 'tab1' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <View>
                                <Text className={`font-bold ${activeTab === 'tab1' ? 'text-gray-900' : 'text-gray-500'}`}>{tab1Label}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab('tab2')}
                            className={`flex-1 py-3 items-center rounded-lg ${activeTab === 'tab2' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <View>
                                <Text className={`font-bold ${activeTab === 'tab2' ? 'text-gray-900' : 'text-gray-500'}`}>{tab2Label}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View className="flex-1">
                {renderTabContent()}
            </View>
        </SafeAreaView>
    );
}
