import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Package, Truck, Clock, CheckCircle } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useOrders } from '../../../hooks/useShop';
import { formatCurrency } from '../../../utils/currency';
import { DELIVERY_FEE } from '../../../utils/constants';

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // In a real app we'd fetch a single order by ID here. 
    // Since our mock hook just fetches all, we filter.
    const { data: orders, isLoading } = useOrders();
    const order = orders?.find((o: any) => o.id === id);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 flex justify-center items-center">
                <ActivityIndicator size="large" color="#4ADE80" />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 p-6 flex justify-center items-center">
                <Text className="text-xl font-bold text-gray-900 mb-4">Order Not Found</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-primary px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const deliveryFee = DELIVERY_FEE;

    // Instead of subtracting, we calculate the items sum (if available) or assume the `totalAmount`
    // from backend already correctly reflects the total. We ensure `total = subtotal + deliveryFee` 
    // for presentation.
    const subtotal = order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const displayTotal = subtotal + deliveryFee;

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
            case 'PENDING': return <Clock size={20} color="#C2410C" />;
            case 'PROCESSING': return <Clock size={20} color="#A16207" />;
            case 'SHIPPED': return <Truck size={20} color="#1D4ED8" />;
            case 'DELIVERED': return <CheckCircle size={20} color="#15803D" />;
            case 'CANCELLED': return <Package size={20} color="#B91C1C" />;
            default: return <Package size={20} color="#374151" />;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center p-4 bg-white shadow-sm z-10 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft color="#374151" size={24} />
                </TouchableOpacity>
                <View>
                    <Text className="text-lg font-bold text-gray-900 ml-2">Order Details</Text>
                    <Text className="text-xs text-gray-500 ml-2">ID: {order.id.slice(-8).toUpperCase()}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                {/* Status Ticket */}
                <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 items-center">
                    <View className={`w-16 h-16 rounded-full items-center justify-center mb-3 ${getStatusColor(order.status).split(' ')[0]}`}>
                        {getStatusIcon(order.status)}
                    </View>
                    <Text className="text-xl font-bold text-gray-900 mb-1">{order.status}</Text>
                    <Text className="text-gray-500 text-sm mb-4">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>

                {/* Items List */}
                <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Products Ordered</Text>
                    {order.items.map((item: any, idx: number) => (
                        <View key={item.product?.id || idx} className={`flex-row justify-between items-center py-3 ${idx < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                            <View className="flex-row items-center flex-1 pr-4">
                                <Text className="font-bold text-gray-700 w-6">{item.quantity}x</Text>
                                <Text className="text-gray-800" numberOfLines={2}>{item.product?.name || 'Unknown Product'}</Text>
                            </View>
                            <Text className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</Text>
                        </View>
                    ))}
                </View>

                {/* Delivery Information Mock */}
                <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row items-center mb-4">
                        <Truck color="#9CA3AF" size={20} />
                        <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-2">Delivery Details</Text>
                    </View>
                    <Text className="text-base font-bold text-gray-900 mb-1">Standard Delivery</Text>
                    <Text className="text-gray-600 leading-5">Expected Delivery: {new Date(new Date(order.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}</Text>
                </View>

                {/* Totals Breakdown */}
                <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-10">
                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Breakdown</Text>
                    <View className="flex-row justify-between mb-3">
                        <Text className="text-gray-500">Products Subtotal</Text>
                        <Text className="font-medium text-gray-900">{formatCurrency(subtotal)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-500">Delivery Fee</Text>
                        <Text className="font-medium text-gray-900">{formatCurrency(deliveryFee)}</Text>
                    </View>
                    <View className="h-[1px] bg-gray-200 mb-4" />
                    <View className="flex-row justify-between items-center">
                        <Text className="text-lg font-bold text-gray-900">Total Paid</Text>
                        <Text className="text-3xl font-black text-gray-900">{formatCurrency(displayTotal)}</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
