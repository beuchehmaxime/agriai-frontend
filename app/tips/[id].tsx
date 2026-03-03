import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, Bookmark, Clock, BookOpen, Trash2, Edit2 } from 'lucide-react-native';
import { useTip, useVoteTip, useDeleteTip } from '../../hooks/useTips';
import { useUserStore } from '../../store/userStore';
import FullScreenLoader from '../../components/FullScreenLoader';

export default function TipDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { userId } = useUserStore();

    const { data: tip, isLoading, error } = useTip(id as string);
    const { mutate: voteTip } = useVoteTip();
    const { mutate: deleteTip, isPending: isDeleting } = useDeleteTip();

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#4ADE80" />
            </SafeAreaView>
        );
    }

    if (error || !tip) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-white">
                <Text className="text-gray-500 mb-4">Tip not found or error loading.</Text>
                <TouchableOpacity onPress={() => router.back()} className="px-6 py-3 bg-primary rounded-xl">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const isAuthor = tip.authorId === userId;

    const handleDelete = () => {
        Alert.alert(
            "Delete Tip",
            "Are you sure you want to delete this tip? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteTip(tip.id, {
                            onSuccess: () => {
                                Alert.alert("Success", "Tip deleted successfully");
                                router.back();
                            },
                            onError: (err) => {
                                Alert.alert("Error", err.message || "Failed to delete tip");
                            }
                        });
                    }
                }
            ]
        );
    };

    const handleVote = (isHelpful: boolean) => {
        voteTip({ id: tip.id, isHelpful });
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header Overlay */}
            <View className="absolute top-16 left-0 right-0 z-20 flex-row justify-between px-4">
                <TouchableOpacity onPress={() => router.back()} className="p-2 bg-black/30 rounded-full">
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <View className="flex-row gap-2">
                    {isAuthor && (
                        <>
                            <TouchableOpacity
                                onPress={() => router.push(`/tips/edit/${tip.id}`)}
                                className="p-2 bg-black/30 rounded-full"
                            >
                                <Edit2 color="white" size={20} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleDelete}
                                className="p-2 bg-red-500/80 rounded-full"
                            >
                                <Trash2 color="white" size={20} />
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity className="p-2 bg-black/30 rounded-full">
                        <Share2 color="white" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-2 bg-black/30 rounded-full">
                        <Bookmark color="white" size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" bounces={false}>
                {tip.imageUrl ? (
                    <Image
                        source={{ uri: tip.imageUrl }}
                        className="w-full h-80"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full h-80 bg-blue-50 items-center justify-center">
                        <BookOpen color="#3B82F6" size={64} opacity={0.5} />
                    </View>
                )}

                <View className="p-6 -mt-8 bg-white rounded-t-[40px] min-h-screen">
                    <View className="flex-row items-center mb-4 justify-between">
                        <View className="flex-row items-center">
                            <View className={`px-3 py-1 rounded-full mr-3 ${tip.status === 'APPROVED' ? 'bg-green-100' : tip.status === 'REJECTED' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                                <Text className={`text-xs font-bold uppercase ${tip.status === 'APPROVED' ? 'text-green-700' : tip.status === 'REJECTED' ? 'text-red-700' : 'text-yellow-700'}`}>
                                    {tip.status}
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <Clock color="#9CA3AF" size={14} />
                                <Text className="text-gray-400 text-xs ml-1">{new Date(tip.createdAt).toLocaleDateString()}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center gap-2">
                            <Text className="text-gray-400 text-xs">👍 {tip.upvotes}</Text>
                            <Text className="text-gray-400 text-xs">👎 {tip.downvotes}</Text>
                        </View>
                    </View>

                    <Text className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
                        {tip.title}
                    </Text>

                    <Text className="text-primary font-semibold text-sm mb-6">By {tip.author?.name || 'Unknown Author'}</Text>

                    <View className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8">
                        <Text className="text-gray-800 text-lg leading-8 font-medium">
                            {tip.content}
                        </Text>
                    </View>

                    {/* Voting Section */}
                    {tip.status === 'APPROVED' && (
                        <View className="mt-6 p-6 bg-primary/5 rounded-3xl border border-primary/10 items-center">
                            <BookOpen color="#4ADE80" size={32} />
                            <Text className="font-bold text-gray-800 mt-2">Was this helpful?</Text>
                            <View className="flex-row gap-4 mt-4">
                                <TouchableOpacity
                                    onPress={() => handleVote(true)}
                                    className={`px-6 py-2 rounded-full flex-row items-center gap-2 ${tip.userVote === true ? 'bg-primary' : 'bg-white border border-primary'}`}
                                >
                                    <Text className={tip.userVote === true ? 'text-white font-bold' : 'text-primary font-bold'}>Yes</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleVote(false)}
                                    className={`px-6 py-2 rounded-full flex-row items-center gap-2 ${tip.userVote === false ? 'bg-gray-800' : 'bg-white border border-gray-300'}`}
                                >
                                    <Text className={tip.userVote === false ? 'text-white font-bold' : 'text-gray-600 font-bold'}>No</Text>
                                </TouchableOpacity>
                            </View>
                            {tip.hasVoted && (
                                <Text className="text-xs text-gray-500 mt-3 text-center">You have already voted. Voting again will update your choice.</Text>
                            )}
                        </View>
                    )}

                    <View className="h-40" />
                </View>
            </ScrollView>
            <FullScreenLoader visible={isDeleting} message="Deleting tip..." />
        </SafeAreaView>
    );
}
