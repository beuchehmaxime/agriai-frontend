import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Users, Plus, Search, MapPin, MessageSquare, ChevronRight, Lock, WifiOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { useNetwork } from '../../context/NetworkContext';
import IsOffline from '../../components/IsOffline';

export const MOCK_COMMUNITIES = [
    {
        id: '1',
        name: 'Yaoundé Maize Farmers',
        description: 'Sharing best practices for maize cultivation in the center region.',
        members: 156,
        location: 'Yaoundé',
        image: 'https://images.unsplash.com/photo-1594913785162-e678564d2757?q=80&w=200&auto=format&fit=crop',
        category: 'Crops'
    },
    {
        id: '2',
        name: 'Organic Pest Control',
        description: 'Natural ways to fight pests without harmful chemicals.',
        members: 89,
        location: 'National',
        image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=200&auto=format&fit=crop',
        category: 'Organic'
    },
    {
        id: '3',
        name: 'Livestock Cameroon',
        description: 'For poultry and cattle farmers to discuss health and feed.',
        members: 245,
        location: 'Douala',
        image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=200&auto=format&fit=crop',
        category: 'Livestock'
    }
];

export default function CommunityScreen() {
    const { userType } = useUserStore();
    const router = useRouter();
    const { isConnected } = useNetwork();

    const renderCommunityCard = ({ item }: { item: typeof MOCK_COMMUNITIES[0] }) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: '/community/[id]', params: { id: item.id } })}
            className="bg-white p-4 rounded-2xl shadow-sm mb-4"
        >
            <View className="flex-row items-center">
                <Image
                    source={{ uri: item.image }}
                    className="w-16 h-16 rounded-xl mr-4 bg-gray-100"
                />
                <View className="flex-1">
                    <Text className="font-extrabold text-gray-900 text-lg leading-tight" numberOfLines={1}>{item.name}</Text>
                    <View className="flex-row items-center mt-1">
                        <MapPin color="#9CA3AF" size={12} />
                        <Text className="text-gray-400 text-xs ml-1">{item.location} • {item.members} members</Text>
                    </View>
                </View>
                <ChevronRight color="#D1D5DB" size={20} />
            </View>
            <Text className="text-gray-500 text-sm mt-3" numberOfLines={2}>{item.description}</Text>

            <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-50">
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                    <Text className="text-primary text-[10px] font-bold uppercase">{item.category}</Text>
                </View>
                <TouchableOpacity className="bg-primary px-4 py-1.5 rounded-lg">
                    <Text className="text-white font-bold text-xs">Join Group</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (!isConnected) {
        return <IsOffline message="Please connect to the internet to access communities." />;
    }

    if (userType === 'guest') {
        return (
            <SafeAreaView className="flex-1 bg-white p-6 justify-center items-center">
                <View className="bg-primary/10 p-8 rounded-full mb-8">
                    <Lock color="#4ADE80" size={64} />
                </View>
                <Text className="text-3xl font-black text-gray-900 text-center mb-4">Sign Up Required</Text>
                <Text className="text-gray-500 text-center text-lg mb-10 leading-6">
                    Join thousands of farmers! Create a full account to join communities, ask questions, and share your knowledge.
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/auth/register')}
                    className="bg-primary w-full py-4 rounded-2xl shadow-lg shadow-green-200"
                >
                    <Text className="text-white text-center font-bold text-lg">Create Account</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white p-4 border-b border-gray-100">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                            <ChevronLeft color="#374151" size={24} />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-gray-900">Communities</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/community/create')}
                        className="p-2 bg-primary/10 rounded-full"
                    >
                        <Plus color="#4ADE80" size={24} />
                    </TouchableOpacity>
                </View>

                <View className="bg-gray-100 flex-row items-center px-4 py-3 rounded-2xl">
                    <Search color="#9CA3AF" size={20} />
                    <Text className="text-gray-400 ml-3">Search for keywords, crops, or regions...</Text>
                </View>
            </View>

            <FlatList
                data={MOCK_COMMUNITIES}
                renderItem={renderCommunityCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20">
                        <Users color="#D1D5DB" size={64} />
                        <Text className="text-gray-400 mt-4">No communities found.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
