import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, Bookmark, Clock, BookOpen } from 'lucide-react-native';
import { MOCK_TIPS } from './index';

export default function TipDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const tip = MOCK_TIPS.find(t => t.id === id);

    if (!tip) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <Text>Tip not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 p-4 bg-primary rounded-xl">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header Overlay */}
            <View className="absolute top-12 left-0 right-0 z-20 flex-row justify-between px-4">
                <TouchableOpacity onPress={() => router.back()} className="p-2 bg-black/30 rounded-full">
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <View className="flex-row gap-2">
                    <TouchableOpacity className="p-2 bg-black/30 rounded-full">
                        <Share2 color="white" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-2 bg-black/30 rounded-full">
                        <Bookmark color="white" size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" bounces={false}>
                <Image
                    source={{ uri: tip.image.replace('w=200', 'w=800') }}
                    className="w-full h-80"
                    resizeMode="cover"
                />

                <View className="p-6 -mt-8 bg-white rounded-t-[40px] min-h-screen">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-green-100 px-3 py-1 rounded-full mr-3">
                            <Text className="text-green-700 text-xs font-bold uppercase">{tip.category}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Clock color="#9CA3AF" size={14} />
                            <Text className="text-gray-400 text-xs ml-1">5 min read</Text>
                        </View>
                    </View>

                    <Text className="text-3xl font-extrabold text-gray-900 leading-tight mb-4">
                        {tip.title}
                    </Text>

                    <Text className="text-gray-500 text-sm mb-6">Published on {tip.date}</Text>

                    <View className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8">
                        <Text className="text-gray-800 text-lg leading-8 font-medium">
                            {tip.content}
                        </Text>
                    </View>

                    <Text className="text-xl font-bold text-gray-900 mb-4">Key Takeaways</Text>
                    {[
                        "Water deeply to encourage root growth.",
                        "Avoid surface watering during peak heat.",
                        "Mulch around plants to retain moisture."
                    ].map((bullet, i) => (
                        <View key={i} className="flex-row items-center mb-3">
                            <View className="w-2 h-2 bg-primary rounded-full mr-3" />
                            <Text className="text-gray-600 text-base">{bullet}</Text>
                        </View>
                    ))}

                    <View className="mt-10 p-6 bg-primary/5 rounded-3xl border border-primary/10 items-center">
                        <BookOpen color="#4ADE80" size={32} />
                        <Text className="font-bold text-gray-800 mt-2">Was this helpful?</Text>
                        <View className="flex-row gap-4 mt-4">
                            <TouchableOpacity className="px-6 py-2 bg-primary rounded-full">
                                <Text className="text-white font-bold">Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="px-6 py-2 bg-white border border-gray-200 rounded-full">
                                <Text className="text-gray-600 font-bold">No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="h-40" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
