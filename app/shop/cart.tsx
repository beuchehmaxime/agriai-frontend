import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../store/useCartStore';
import { formatCurrency } from '../../utils/currency';

export default function CartScreen() {
    const router = useRouter();
    const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

    const handleRemoveItem = (productId: string, productName: string) => {
        Alert.alert(
            "Remove Item",
            `Are you sure you want to remove ${productName} from your cart?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", style: "destructive", onPress: () => removeItem(productId) }
            ]
        );
    };

    if (items.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-row items-center p-4 bg-white shadow-sm z-10">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <ChevronLeft color="#374151" size={24} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-gray-900 ml-2">My Cart</Text>
                </View>
                <View className="flex-1 items-center justify-center p-6">
                    <View className="bg-primary/10 p-8 rounded-full mb-6">
                        <ShoppingBag color="#4ADE80" size={64} />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty.</Text>
                    <Text className="text-gray-500 text-center text-lg mb-8">
                        Browse our shop to find the best agricultural products.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.navigate('/(tabs)/shop')}
                        className="bg-primary px-8 py-4 rounded-full shadow-lg shadow-green-200"
                    >
                        <Text className="text-white font-bold text-lg">Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 bg-white shadow-sm z-10">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <ChevronLeft color="#374151" size={24} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-gray-900 ml-2">My Cart</Text>
                </View>
                <Text className="text-primary font-bold">{items.length} items</Text>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {items.map((item) => (
                    <View key={item.product.id} className="bg-white p-4 rounded-2xl shadow-sm mb-4 flex-row border border-gray-100">
                        <View className="w-24 h-24 bg-gray-50 rounded-xl mr-4 overflow-hidden">
                            {item.product.imageUrl ? (
                                <Image source={{ uri: item.product.imageUrl }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <View className="w-full h-full items-center justify-center">
                                    <ShoppingBag color="#CBD5E1" size={24} />
                                </View>
                            )}
                        </View>
                        <View className="flex-1 justify-between py-1">
                            <View>
                                <View className="flex-row justify-between items-start">
                                    <Text className="text-base font-bold text-gray-900 flex-1 mr-2" numberOfLines={2}>
                                        {item.product.name}
                                    </Text>
                                    <TouchableOpacity onPress={() => handleRemoveItem(item.product.id, item.product.name)} className="p-1">
                                        <Trash2 color="#EF4444" size={20} />
                                    </TouchableOpacity>
                                </View>
                                <Text className="text-lg font-black text-gray-900 mt-1">{formatCurrency(item.product.price)}</Text>
                            </View>

                            <View className="flex-row items-center justify-between mt-2">
                                <View className="flex-row items-center bg-gray-100 rounded-full">
                                    <TouchableOpacity
                                        onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                                        className="w-8 h-8 items-center justify-center"
                                    >
                                        <Minus color="#4B5563" size={16} />
                                    </TouchableOpacity>
                                    <Text className="w-8 text-center font-bold text-gray-900">{item.quantity}</Text>
                                    <TouchableOpacity
                                        onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                                        className="w-8 h-8 items-center justify-center"
                                        disabled={item.quantity >= item.product.stockQuantity}
                                    >
                                        <Plus color={item.quantity >= item.product.stockQuantity ? "#D1D5DB" : "#4B5563"} size={16} />
                                    </TouchableOpacity>
                                </View>
                                <Text className="text-gray-500 font-medium">
                                    {formatCurrency(item.product.price * item.quantity)}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View className="bg-white p-6 shadow-lg border-t border-gray-100">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-gray-500 text-lg">Total Amount</Text>
                    <Text className="text-2xl font-black text-gray-900">{formatCurrency(getTotalPrice())}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/shop/checkout')}
                    className="bg-primary w-full py-4 rounded-2xl shadow-lg shadow-green-200"
                >
                    <Text className="text-white text-center font-bold text-lg">Proceed to Checkout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
