import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ImagePlus, X } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTip, useUpdateTip } from '../../../hooks/useTips';
import FullScreenLoader from '../../../components/FullScreenLoader';

export default function EditTipScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const { data: tip, isLoading: isFetching, error } = useTip(id as string);
    const { mutate: updateTip, isPending } = useUpdateTip();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);

    // Pre-fill form when tip data is loaded
    useEffect(() => {
        if (tip) {
            setTitle(tip.title);
            setContent(tip.content);
            setImageUri(tip.imageUrl || null);
        }
    }, [tip]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleUpdate = () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert("Missing Fields", "Please provide both a title and content for your tip.");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);

        // Only append image if it's a new local URI from ImagePicker (not the existing Cloudinary URL)
        if (imageUri && !imageUri.startsWith('http')) {
            const filename = imageUri.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('image', {
                uri: imageUri,
                name: filename,
                type,
            } as any);
        }

        updateTip({ id: tip!.id, formData }, {
            onSuccess: () => {
                Alert.alert("Success", "Tip updated successfully!", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            },
            onError: (error) => {
                Alert.alert("Error", error.message || "Failed to update tip.");
            }
        });
    };
    if (isFetching) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#4ADE80" />
            </SafeAreaView>
        );
    }

    if (error || !tip) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-white">
                <Text className="text-gray-500 mb-4">Tip not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="px-6 py-3 bg-primary rounded-xl">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft color="#374151" size={24} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Edit Tip</Text>
                <TouchableOpacity onPress={handleUpdate} disabled={isPending} className={`px-4 py-2 rounded-full ${isPending ? 'bg-primary/50' : 'bg-primary'}`}>
                    <Text className="text-white font-bold">Save</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView className="flex-1 p-4">
                    <Text className="text-gray-700 font-bold mb-2 ml-1">Tip Title</Text>
                    <TextInput
                        className="bg-gray-50 p-4 rounded-2xl mb-6 text-gray-900 font-medium border border-gray-100"
                        placeholder="E.g., How to detect early maize disease"
                        placeholderTextColor="#00000066"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />

                    <Text className="text-gray-700 font-bold mb-2 ml-1">Tip Content</Text>
                    <TextInput
                        className="bg-gray-50 p-4 rounded-2xl mb-6 text-gray-900 border border-gray-100 leading-relaxed"
                        placeholder="Share your agricultural knowledge here..."
                        placeholderTextColor="#00000066"
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                        style={{ minHeight: 150 }}
                    />

                    <Text className="text-gray-700 font-bold mb-2 ml-1">Cover Image</Text>
                    {imageUri ? (
                        <View className="relative w-full h-48 rounded-2xl mb-8">
                            <Image source={{ uri: imageUri }} className="w-full h-full rounded-2xl" />
                            <TouchableOpacity
                                onPress={() => setImageUri(null)}
                                className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
                            >
                                <X color="white" size={20} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={pickImage}
                            className="bg-blue-50 border-2 border-dashed border-blue-200 h-48 rounded-2xl items-center justify-center mb-8"
                        >
                            <ImagePlus color="#3B82F6" size={40} />
                            <Text className="text-blue-500 font-medium mt-2">Tap to upload a cover image</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            <FullScreenLoader visible={isPending} message="Updating your tip..." />
        </SafeAreaView>
    );
}
