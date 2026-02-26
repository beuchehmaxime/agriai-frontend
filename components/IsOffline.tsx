import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WifiOff } from 'lucide-react-native';

interface IsOfflineProps {
    message?: string;
}

export default function IsOffline({ message = "Please connect to the internet to view this content." }: IsOfflineProps) {
    return (
        <SafeAreaView className="flex-1 bg-white p-6 justify-center items-center">
            <View className="bg-red-50 p-8 rounded-full mb-8">
                <WifiOff color="#EF4444" size={64} />
            </View>
            <Text className="text-3xl font-black text-gray-900 text-center mb-4">Offline</Text>
            <Text className="text-gray-500 text-center text-lg mb-10 leading-6">
                {message}
            </Text>
        </SafeAreaView>
    );
}
