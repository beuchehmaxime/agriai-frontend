import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Package, Clock, CheckCircle } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useOrders } from '../../hooks/useShop';
import { formatCurrency } from '../../utils/currency';
import { DELIVERY_FEE } from '../../utils/constants';

export default function OrdersScreen() {
    const router = useRouter();
    const { fromSuccess } = useLocalSearchParams();
    const { data: orders, isLoading } = useOrders();

    const handleBack = () => {
        if (fromSuccess === 'true') {
            router.replace('/(tabs)');
        } else {
            router.back();
        }
        return true;
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
        return () => backHandler.remove();
    }, [fromSuccess]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'PROCESSING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'SHIPPED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock size={16} color="#C2410C" />;
            case 'PROCESSING': return <Clock size={16} color="#A16207" />;
            case 'SHIPPED': return <Package size={16} color="#1D4ED8" />;
            case 'DELIVERED': return <CheckCircle size={16} color="#15803D" />;
            case 'CANCELLED': return <Clock size={16} color="#B91C1C" />;
            default: return <Clock size={16} color="#374151" />;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center p-4 bg-white shadow-sm z-10">
                <TouchableOpacity onPress={handleBack} className="p-2">
                    <ChevronLeft color="#374151" size={24} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 ml-2">My Orders</Text>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4ADE80" />
                    <Text className="text-gray-500 mt-4">Loading your orders...</Text>
                </View>
            ) : !orders || orders.length === 0 ? (
                <View className="flex-1 items-center justify-center p-6">
                    <View className="bg-gray-100 p-8 rounded-full mb-6 relative">
                        <Package color="#9CA3AF" size={64} />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</Text>
                    <Text className="text-gray-500 text-center text-lg mb-8">
                        You haven't placed any orders. Start shopping to see your history here.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.replace('/(tabs)/shop')}
                        className="bg-primary px-8 py-4 rounded-full shadow-lg shadow-green-200"
                    >
                        <Text className="text-white font-bold text-lg">Shop Now</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                    {orders.map((order: any) => {
                        const subtotal = order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
                        const displayTotal = subtotal + DELIVERY_FEE;

                        return (
                            <TouchableOpacity
                                key={order.id}
                                onPress={() => router.push(`/shop/order/${order.id}`)}
                                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-4"
                            >
                                <View className="flex-row justify-between items-center mb-4">
                                    <View>
                                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</Text>
                                        <Text className="text-sm font-medium text-gray-900">{order.id.slice(-8).toUpperCase()}</Text>
                                    </View>
                                    <View className={`flex-row items-center px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        <Text className="text-xs font-bold uppercase tracking-wider ml-1 -mt-0.5">{order.status}</Text>
                                    </View>
                                </View>

                                <View className="h-[1px] bg-gray-100 mb-4" />

                                <View className="flex-row justify-between items-end">
                                    <View className="flex-1">
                                        <Text className="text-xs text-gray-500 mb-1">{new Date(order.createdAt).toLocaleDateString()}</Text>
                                        <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>
                                            {order.items.slice(0, 2).map((i: any) => i.product.name).join(', ')}
                                            {order.items.length > 2 ? ' ...' : ''}
                                        </Text>
                                    </View>
                                    <View className="items-end pl-4">
                                        <Text className="text-sm font-bold text-gray-400 mb-1">{order.items.length} item(s)</Text>
                                        <Text className="text-2xl font-black text-gray-900">{formatCurrency(displayTotal)}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                    <View className="h-10" />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
