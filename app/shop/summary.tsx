import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Receipt, CreditCard, Banknote } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCartStore } from '../../store/useCartStore';
import { useCreateOrder } from '../../hooks/useShop';
import FullScreenLoader from '../../components/FullScreenLoader';
import { formatCurrency } from '../../utils/currency';
import { DELIVERY_FEE } from '../../utils/constants';

export default function SummaryScreen() {
    const router = useRouter();
    const { shipping } = useLocalSearchParams();
    const shippingDetails = typeof shipping === 'string' ? JSON.parse(shipping) : {};

    const { items, getTotalPrice, clearCart } = useCartStore();
    const createOrderMutation = useCreateOrder();

    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mtn' | 'orange'>('cash');
    const [momoNumber, setMomoNumber] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const handleConfirmOrder = () => {
        const cleanedNumber = momoNumber.replace(/\s/g, '');
        if ((paymentMethod === 'mtn' || paymentMethod === 'orange') && cleanedNumber.length < 9) {
            Alert.alert("Invalid Number", "Please enter a valid 9-digit Mobile Money number to proceed.");
            return;
        }

        const processOrder = () => {
            const orderPayload = {
                items: items.map(i => ({
                    productId: i.product.id,
                    quantity: i.quantity
                }))
                // backend requires proper shipping info usually, demo:
                // paymentMethod,
                // momoNumber: paymentMethod !== 'cash' ? momoNumber : undefined
            };

            createOrderMutation.mutate(orderPayload, {
                onSuccess: (data) => {
                    clearCart();

                    // Dismiss the screens in the current stack (Summary, Checkout, Cart) 
                    // and then route to the success screen directly so the back button won't 
                    // lead back to an empty checkout.
                    if (router.canDismiss()) {
                        router.dismissAll();
                    }
                    router.replace('/shop/success');
                }
            });
        };

        if (paymentMethod !== 'cash') {
            setIsProcessingPayment(true);
            setTimeout(() => {
                setIsProcessingPayment(false);
                // 80% success rate for demo purposes
                const isSuccess = Math.random() > 0.2;
                if (isSuccess) {
                    processOrder();
                } else {
                    Alert.alert(
                        "Transaction Failed",
                        "The mobile money transaction was declined or timed out. Please check your balance and try again."
                    );
                }
            }, 3000); // Simulated 3 second API wait
        } else {
            processOrder();
        }
    };

    const subtotal = getTotalPrice();
    const deliveryFee = DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <FullScreenLoader visible={createOrderMutation.isPending || isProcessingPayment} message={isProcessingPayment ? "Awaiting Mobile Money confirmation..." : "Processing your order..."} />

            {/* Header */}
            <View className="flex-row items-center justify-between p-4 bg-white shadow-sm z-10">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <ChevronLeft color="#374151" size={24} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-gray-900 ml-2">Order Summary</Text>
                </View>
            </View>

            <KeyboardAwareScrollView
                className="flex-1 p-6"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                extraScrollHeight={80}
            >

                {/* Stepper */}
                <View className="flex-row items-center justify-center mb-8">
                    <View className="items-center">
                        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mb-1">
                            <Text className="text-white font-bold">✓</Text>
                        </View>
                        <Text className="text-xs text-primary font-bold">Shipping</Text>
                    </View>
                    <View className="w-16 h-1 bg-primary mx-2 mt-[-16px]" />
                    <View className="items-center">
                        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mb-1">
                            <Text className="text-white font-bold">2</Text>
                        </View>
                        <Text className="text-xs text-primary font-bold">Payment</Text>
                    </View>
                </View>

                {/* Shipping Review */}
                <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Deliver To</Text>
                    <Text className="text-base font-bold text-gray-900 mb-1">{shippingDetails.fullName}</Text>
                    <Text className="text-gray-600 mb-1">{shippingDetails.address}</Text>
                    <Text className="text-gray-600 mb-1">{shippingDetails.city}</Text>
                    <Text className="text-gray-500 text-sm mt-2">Phone: {shippingDetails.phone}</Text>
                </View>

                {/* Items Review */}
                <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest">Order Items</Text>
                        <Text className="text-primary font-bold">{items.length} items</Text>
                    </View>

                    {items.map((item, idx) => (
                        <View key={item.product.id} className={`flex-row justify-between items-center py-3 ${idx < items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                            <View className="flex-row items-center flex-1 pr-4">
                                <Text className="font-bold text-gray-700 w-6">{item.quantity}x</Text>
                                <Text className="text-gray-800" numberOfLines={1}>{item.product.name}</Text>
                            </View>
                            <Text className="font-bold text-gray-900">{formatCurrency(item.product.price * item.quantity)}</Text>
                        </View>
                    ))}
                </View>

                {/* Payment Options (Mock) */}
                <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Method</Text>

                    {/* Cash */}
                    <TouchableOpacity
                        onPress={() => {
                            setPaymentMethod('cash');
                            setMomoNumber('');
                        }}
                        className={`flex-row items-center p-4 rounded-xl border mb-3 ${paymentMethod === 'cash' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200'}`}
                    >
                        <Banknote color={paymentMethod === 'cash' ? "#16A34A" : "#9CA3AF"} size={24} />
                        <Text className={`font-bold ml-3 text-base ${paymentMethod === 'cash' ? 'text-green-800' : 'text-gray-600'}`}>Cash on Delivery</Text>
                    </TouchableOpacity>

                    {/* MTN */}
                    <TouchableOpacity
                        onPress={() => {
                            setPaymentMethod('mtn');
                            setMomoNumber('');
                        }}
                        className={`flex-row items-center p-4 rounded-xl border ${paymentMethod === 'mtn' ? 'bg-yellow-50 border-yellow-500 mb-2' : 'bg-gray-50 border-gray-200 mb-3'}`}
                    >
                        <View className="w-8 h-8 rounded-full bg-yellow-400 items-center justify-center">
                            <Text className="text-[10px] font-black text-black">MTN</Text>
                        </View>
                        <Text className={`font-bold ml-3 text-base ${paymentMethod === 'mtn' ? 'text-yellow-800' : 'text-gray-600'}`}>MTN Mobile Money</Text>
                    </TouchableOpacity>

                    {paymentMethod === 'mtn' && (
                        <View className="mb-4">
                            <Text className="text-sm font-bold text-gray-700 mb-2">MTN Mobile Money Number</Text>
                            <TextInput
                                className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800 border border-yellow-200"
                                value={momoNumber}
                                onChangeText={setMomoNumber}
                                keyboardType="phone-pad"
                                placeholder="e.g. 67X XXX XXX"
                            />
                        </View>
                    )}

                    {/* Orange */}
                    <TouchableOpacity
                        onPress={() => {
                            setPaymentMethod('orange');
                            setMomoNumber('');
                        }}
                        className={`flex-row items-center p-4 rounded-xl border ${paymentMethod === 'orange' ? 'bg-orange-50 border-orange-500 mb-2' : 'bg-gray-50 border-gray-200 mb-0'}`}
                    >
                        <View className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center">
                            <Text className="text-[10px] font-black text-white">OM</Text>
                        </View>
                        <Text className={`font-bold ml-3 text-base ${paymentMethod === 'orange' ? 'text-orange-800' : 'text-gray-600'}`}>Orange Money</Text>
                    </TouchableOpacity>

                    {paymentMethod === 'orange' && (
                        <View className="mt-2 text-sm">
                            <Text className="text-sm font-bold text-gray-700 mb-2">Orange Money Number</Text>
                            <TextInput
                                className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800 border border-orange-200"
                                value={momoNumber}
                                onChangeText={setMomoNumber}
                                keyboardType="phone-pad"
                                placeholder="e.g. 65X XXX XXX"
                            />
                        </View>
                    )}
                </View>

                {/* Totals */}
                <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-10">
                    <View className="flex-row justify-between mb-3">
                        <Text className="text-gray-500">Subtotal</Text>
                        <Text className="font-medium text-gray-900">{formatCurrency(subtotal)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-500">Delivery Fee</Text>
                        <Text className="font-medium text-gray-900">{formatCurrency(deliveryFee)}</Text>
                    </View>
                    <View className="h-[1px] bg-gray-200 mb-4" />
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-lg font-bold text-gray-900">Total</Text>
                        <Text className="text-3xl font-black text-gray-900">{formatCurrency(total)}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleConfirmOrder}
                        className="bg-primary w-full py-4 rounded-2xl shadow-lg shadow-green-200 flex-row justify-center items-center"
                    >
                        <Receipt color="white" size={20} className="mr-2" />
                        <Text className="text-white text-center font-bold text-lg">Confirm Order</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
