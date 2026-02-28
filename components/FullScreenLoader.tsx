import React from 'react';
import { View, Modal, ActivityIndicator, Text } from 'react-native';

interface FullScreenLoaderProps {
    visible: boolean;
    message?: string;
}

export default function FullScreenLoader({ visible, message = 'Loading...' }: FullScreenLoaderProps) {
    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={() => { }} // Prevent closing on hardware back button on Android
        >
            <View className="flex-1 justify-center items-center bg-black/60">
                <View className="bg-white p-6 rounded-2xl items-center shadow-lg border border-gray-100 flex-row gap-4">
                    <ActivityIndicator size="large" color="#4ADE80" />
                    {message && (
                        <Text className="text-gray-800 font-semibold text-base mt-2 ml-2 mb-2">
                            {message}
                        </Text>
                    )}
                </View>
            </View>
        </Modal>
    );
}
