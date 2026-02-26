import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Camera, LayoutGrid, MapPin, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function CreateCommunityScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('Yaoundé');
    const [category, setCategory] = useState('Crops');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name || !description) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            Alert.alert('Success', 'Your community has been created! Waiting for moderation.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        }, 1500);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                    <ChevronLeft color="#374151" size={24} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Create New Community</Text>
            </View>

            <ScrollView className="flex-1 p-6">
                <View className="items-center mb-8">
                    <TouchableOpacity className="w-32 h-32 bg-gray-100 rounded-3xl items-center justify-center border-2 border-dashed border-gray-300">
                        <Camera color="#9CA3AF" size={40} />
                        <Text className="text-gray-400 mt-2 font-bold text-xs uppercase">Add Cover</Text>
                    </TouchableOpacity>
                </View>

                <View className="mb-6">
                    <Input
                        label="Community Name"
                        placeholder="e.g. West Region Tomato Growers"
                        value={name}
                        onChangeText={setName}
                    />

                    <View className="mb-4">
                        <Text className="text-gray-700 font-bold mb-2">Description</Text>
                        <Input
                            placeholder="What is this community about?"
                            value={description}
                            onChangeText={setDescription}
                            className="h-32 text-top"
                        />
                    </View>

                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1">
                            <Text className="text-gray-700 font-bold mb-2">Location</Text>
                            <TouchableOpacity className="bg-gray-50 p-4 rounded-xl flex-row items-center justify-between border border-gray-100">
                                <Text className="text-gray-600">{location}</Text>
                                <MapPin color="#9CA3AF" size={18} />
                            </TouchableOpacity>
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-700 font-bold mb-2">Category</Text>
                            <TouchableOpacity className="bg-gray-50 p-4 rounded-xl flex-row items-center justify-between border border-gray-100">
                                <Text className="text-gray-600">{category}</Text>
                                <LayoutGrid color="#9CA3AF" size={18} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="bg-blue-50 p-4 rounded-2xl flex-row items-start mb-10">
                        <Info color="#3B82F6" size={20} />
                        <Text className="text-blue-700 text-xs ml-3 flex-1">
                            New communities are reviewed by our regional coordinators to ensure safety and quality of information.
                        </Text>
                    </View>

                    <Button
                        title="Submit for Approval"
                        onPress={handleCreate}
                        loading={loading}
                    />
                </View>

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
