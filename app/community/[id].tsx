import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, MessageSquare, Users, MapPin, Send } from 'lucide-react-native';
import { MOCK_COMMUNITIES } from './index';

export default function CommunityDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const community = MOCK_COMMUNITIES.find(c => c.id === id);

    const posts = [
        { id: '1', user: 'Jean Pierre', content: 'Anyone has advice on the best time to apply fertilizer for maize in Yaoundé surroundings?', time: '2h ago', comments: 5 },
        { id: '2', user: 'Agri Bot', content: 'Reminder: New weather alert issued for tomorrow. Check your notifications!', time: '1d ago', comments: 12 }
    ];

    if (!community) return <SafeAreaView><Text>Community not found</Text></SafeAreaView>;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <ChevronLeft color="#374151" size={24} />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>{community.name}</Text>
                        <Text className="text-gray-400 text-[10px]">{community.members} members</Text>
                    </View>
                </View>
                <TouchableOpacity className="p-2">
                    <Share2 color="#374151" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 bg-gray-50">
                <Image source={{ uri: community.image }} className="w-full h-48 bg-gray-200" />

                <View className="p-6 bg-white -mt-6 rounded-t-3xl min-h-screen">
                    <Text className="text-xl font-bold text-gray-900 mb-2">About this Community</Text>
                    <Text className="text-gray-600 leading-6 mb-6">
                        {community.description}
                    </Text>

                    <View className="flex-row items-center justify-between mb-8">
                        <View className="flex-row items-center">
                            <Users color="#4ADE80" size={20} />
                            <Text className="text-gray-700 font-bold ml-2">Discussion Feed</Text>
                        </View>
                        <TouchableOpacity className="bg-primary/10 px-4 py-1.5 rounded-full">
                            <Text className="text-primary font-bold text-xs">+ Post</Text>
                        </TouchableOpacity>
                    </View>

                    {posts.map(post => (
                        <View key={post.id} className="bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100">
                            <View className="flex-row items-center mb-3">
                                <View className="w-8 h-8 bg-green-200 rounded-full items-center justify-center mr-3">
                                    <Text className="font-bold text-green-700 text-xs">{post.user[0]}</Text>
                                </View>
                                <View>
                                    <Text className="font-bold text-gray-800 text-sm">{post.user}</Text>
                                    <Text className="text-gray-400 text-[10px]">{post.time}</Text>
                                </View>
                            </View>
                            <Text className="text-gray-700 text-base leading-6 mb-4">{post.content}</Text>
                            <View className="flex-row items-center space-x-4 gap-4 pt-4 border-t border-gray-200/50">
                                <TouchableOpacity className="flex-row items-center">
                                    <MessageSquare color="#9CA3AF" size={16} />
                                    <Text className="text-gray-400 text-xs ml-1">{post.comments} comments</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-row items-center">
                                    <Send color="#9CA3AF" size={16} />
                                    <Text className="text-gray-400 text-xs ml-1">Share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    <View className="h-40" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
