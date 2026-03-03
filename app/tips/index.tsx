import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, BookOpen, ChevronRight, Plus, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useNetwork } from '../../context/NetworkContext';
import IsOffline from '../../components/IsOffline';
import { useTips } from '../../hooks/useTips';
import { useUserStore } from '../../store/userStore';
import { Tip } from '../../types';

export default function TipsScreen() {
    const router = useRouter();
    const { isConnected } = useNetwork();
    const { userType } = useUserStore();
    const [selectedTab, setSelectedTab] = useState<'APPROVED' | 'mine'>('APPROVED');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Only Agronomists can see 'mine' Tips tab filter
    const statusParam = userType === 'Agronomist' ? selectedTab : 'APPROVED';

    const { data: tips, isLoading, error, refetch } = useTips(statusParam);

    const filteredTips = useMemo(() => {
        if (!tips) return [];
        if (!searchQuery.trim()) return tips;

        const lowerCaseQuery = searchQuery.toLowerCase();
        return tips.filter(tip =>
            tip.title.toLowerCase().includes(lowerCaseQuery) ||
            tip.content.toLowerCase().includes(lowerCaseQuery)
        );
    }, [tips, searchQuery]);


    if (!isConnected) {
        return <IsOffline message="Please connect to the internet to view agricultural tips." />;
    }

    const renderTipCard = ({ item }: { item: Tip }) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: '/tips/[id]', params: { id: item.id } })}
            className="bg-white p-4 rounded-2xl shadow-sm flex-row items-center mb-4"
        >
            {item.imageUrl ? (
                <Image
                    source={{ uri: item.imageUrl }}
                    className="w-20 h-20 rounded-xl mr-4 bg-gray-100"
                />
            ) : (
                <View className="w-20 h-20 rounded-xl mr-4 bg-blue-50 items-center justify-center">
                    <BookOpen color="#3B82F6" size={24} />
                </View>
            )}
            <View className="flex-1">
                {userType === 'Agronomist' && selectedTab === 'mine' && (
                    <View className={`px-2 py-0.5 rounded-full self-start mb-1 ${item.status === 'APPROVED' ? 'bg-green-100' : item.status === 'REJECTED' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                        <Text className={`text-[10px] font-bold uppercase ${item.status === 'APPROVED' ? 'text-green-700' : item.status === 'REJECTED' ? 'text-red-700' : 'text-yellow-700'}`}>
                            {item.status}
                        </Text>
                    </View>
                )}
                <Text className="font-bold text-gray-800 text-base" numberOfLines={1}>{item.title}</Text>
                <Text className="text-gray-500 text-xs mt-1" numberOfLines={2}>{item.content}</Text>
                <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-gray-400 text-[10px]">{new Date(item.createdAt).toLocaleDateString()}</Text>
                    <View className="flex-row items-center">
                        <Text className="text-primary text-[10px] font-bold mr-1">Read More</Text>
                        <ChevronRight color="#4ADE80" size={12} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white p-4 pb-6 shadow-sm z-10">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                            <ChevronLeft color="#374151" size={24} />
                        </TouchableOpacity>

                        {isSearching ? (
                            <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 h-10 mr-2">
                                <Search color="#6B7280" size={16} />
                                <TextInput
                                    className="flex-1 ml-2 text-gray-800"
                                    placeholder="Search tips..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    autoFocus
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                                        <X color="#9CA3AF" size={16} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : (
                            <Text className="text-2xl font-bold text-gray-900 flex-1">Agri Tips</Text>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            setIsSearching(!isSearching);
                            if (isSearching) setSearchQuery('');
                        }}
                        className="p-2 bg-gray-100 rounded-full ml-2"
                    >
                        {isSearching ? <X color="#6B7280" size={20} /> : <Search color="#6B7280" size={20} />}
                    </TouchableOpacity>
                </View>

                {userType === 'Agronomist' && (
                    <View className="flex-row space-x-2 gap-2 mt-2">
                        <TouchableOpacity
                            onPress={() => setSelectedTab('APPROVED')}
                            className={`flex-1 py-2 rounded-xl items-center ${selectedTab === 'APPROVED' ? 'bg-primary' : 'bg-gray-100'}`}
                        >
                            <Text className={`text-sm font-bold ${selectedTab === 'APPROVED' ? 'text-white' : 'text-gray-600'}`}>
                                All Tips
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setSelectedTab('mine')}
                            className={`flex-1 py-2 rounded-xl items-center ${selectedTab === 'mine' ? 'bg-primary' : 'bg-gray-100'}`}
                        >
                            <Text className={`text-sm font-bold ${selectedTab === 'mine' ? 'text-white' : 'text-gray-600'}`}>
                                My Tips
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4ADE80" />
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-red-500 text-center mb-4">{(error as Error).message || 'Failed to load tips.'}</Text>
                    <TouchableOpacity onPress={() => refetch()} className="px-6 py-2 bg-primary rounded-full">
                        <Text className="text-white font-bold">Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredTips}
                    renderItem={renderTipCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    refreshing={isLoading}
                    onRefresh={refetch}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <BookOpen color="#D1D5DB" size={64} />
                            <Text className="text-gray-400 mt-4">
                                {searchQuery ? `No tips found matching "${searchQuery}"` : "No tips available yet."}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Floating Action Button for Agronomists */}
            {userType === 'Agronomist' && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 50 }}
                >
                    <TouchableOpacity
                        onPress={() => router.push('/tips/create')}
                        className="w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg shadow-green-200 elevation-5"
                    >
                        <Plus color="white" size={28} />
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}
