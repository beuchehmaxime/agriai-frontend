import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, ShoppingBag } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function OrderSuccessScreen() {
    const router = useRouter();

    useEffect(() => {
        const backAction = () => {
            router.replace('/shop/cart');
            return true; // Keeps the app from closing
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [router]);

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
            <View className="bg-green-100 p-8 rounded-full mb-8 relative">
                <CheckCircle2 color="#16A34A" size={80} />
            </View>
            <Text className="text-3xl font-black text-gray-900 text-center mb-4">Order Placed Successfully!</Text>
            <Text className="text-gray-500 text-center text-lg mb-10 leading-6">
                Your agricultural supplies are being processed. You will be contacted shortly for delivery confirmation.
            </Text>
            <TouchableOpacity
                onPress={() => router.replace({ pathname: '/shop/orders', params: { fromSuccess: 'true' } })}
                className="bg-primary w-full py-4 rounded-2xl shadow-lg shadow-green-200 mb-4"
            >
                <Text className="text-white text-center font-bold text-lg flex-row items-center">View My Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => router.replace('/(tabs)/shop')}
                className="bg-gray-100 w-full py-4 rounded-2xl"
            >
                <Text className="text-gray-700 text-center font-bold text-lg flex-row items-center">Continue Shopping</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
