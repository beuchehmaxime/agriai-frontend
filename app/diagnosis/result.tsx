import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, Save } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import Button from '../../components/Button';
import { markdownStyles } from '@/utils/markdownstyle';

export default function ResultScreen() {
    const { result } = useLocalSearchParams();
    const router = useRouter();

    if (!result) return <View className="flex-1 items-center justify-center"><Text>No result found.</Text></View>;

    const data = JSON.parse(typeof result === 'string' ? result : result[0]);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 bg-white z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft color="#374151" size={24} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-800">Diagnosis Result</Text>
                <TouchableOpacity className="p-2">
                    <Share2 color="#374151" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1"
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}>
                <Image source={{ uri: data.imageUri }} className="w-full h-64" resizeMode="cover" />

                <View className="p-6 -mt-6 bg-white rounded-t-3xl min-h-screen">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-green-600 font-bold tracking-widest capitalize text-xs">{data.crop}</Text>
                        <View className="bg-green-100 px-3 py-1 rounded-full">
                            <Text className="text-green-700 text-xs font-bold">{Math.round(data.confidence * 100)}% Confidence</Text>
                        </View>
                    </View>

                    <Text className="text-3xl font-bold text-gray-900 mb-4">{data.disease}</Text>

                    <View className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                        {/* {typeof data.advice === 'string' ? (
                            <View>
                                {data.advice.split('\n').map((line: string, i: number) => (
                                    <Text key={i} className="text-gray-700 leading-6 mb-1">
                                        {line.trim()}
                                    </Text>
                                ))}
                            </View>
                        ) : (
                            <Text className="text-gray-700 leading-6">
                                {data.advice.summary}
                            </Text>
                        )} */}
                        <Markdown style={markdownStyles}>
                            {data.advice}
                        </Markdown>
                    </View>
                   
                   <View className='flex-row justify-between gap-2'>
                    <Button
                        title="Buy Treatment"
                        onPress={() => router.navigate('/(tabs)/shop')}
                        className="mt-2 mb-2 bg-white w-1/2"
                        variant='yellow'
                    />
                     <Button
                        title="Consult Expert"
                        onPress={() => router.navigate('/(tabs)/shop')}
                        className="mt-2 mb-2 bg-white w-1/2"
                        variant='outline'
                    />
                   </View>
                </View>
            </ScrollView >
        </SafeAreaView >
    );
}
