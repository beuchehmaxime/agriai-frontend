import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Truck, CheckCircle2 } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { useCartStore } from '../../store/useCartStore';

export default function CheckoutScreen() {
    const router = useRouter();
    const { name, phoneNumber, email } = useUserStore();
    const { items } = useCartStore();

    // Default to the logged-in profile details
    const [shippingDetails, setShippingDetails] = useState({
        fullName: name || '',
        phone: phoneNumber || '',
        email: email || '',
        address: '',
        city: '',
        notes: ''
    });

    const [useProfileData, setUseProfileData] = useState(true);

    const handleContinue = () => {
        // Validation could go here
        router.push({
            pathname: '/shop/summary',
            params: {
                shipping: JSON.stringify(shippingDetails)
            }
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center p-4 bg-white shadow-sm z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft color="#374151" size={24} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 ml-2">Checkout Details</Text>
            </View>

            <KeyboardAwareScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                extraScrollHeight={80} // Give inputs breathing room away from the keyboard top
            >
                {/* Stepper */}
                <View className="flex-row items-center justify-center mb-8">
                    <View className="items-center">
                        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mb-1">
                            <Text className="text-white font-bold">1</Text>
                        </View>
                        <Text className="text-xs text-primary font-bold">Shipping</Text>
                    </View>
                    <View className="w-16 h-1 bg-gray-200 mx-2 mt-[-16px]" />
                    <View className="items-center">
                        <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center mb-1">
                            <Text className="text-gray-500 font-bold">2</Text>
                        </View>
                        <Text className="text-xs text-gray-500 font-medium">Payment</Text>
                    </View>
                </View>

                {/* Form Toggle */}
                <TouchableOpacity
                    onPress={() => {
                        setUseProfileData(!useProfileData);
                        if (!useProfileData) {
                            setShippingDetails({
                                ...shippingDetails,
                                fullName: name || '',
                                phone: phoneNumber || '',
                                email: email || ''
                            });
                        }
                    }}
                    className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 mb-6 shadow-sm"
                >
                    <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${useProfileData ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                        {useProfileData && <CheckCircle2 color="white" size={16} />}
                    </View>
                    <Text className="text-gray-800 font-medium flex-1">Use my default account information</Text>
                </TouchableOpacity>

                {/* Form Fields */}
                <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row items-center mb-6">
                        <Truck color="#4ADE80" size={24} />
                        <Text className="text-lg font-bold text-gray-900 ml-2">Shipping Information</Text>
                    </View>

                    <Text className="text-sm font-bold text-gray-700 mb-2">Full Name</Text>
                    <TextInput
                        className={`bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800 border ${useProfileData ? 'border-transparent text-gray-500' : 'border-gray-200'} mb-4`}
                        value={shippingDetails.fullName}
                        onChangeText={(t) => setShippingDetails({ ...shippingDetails, fullName: t })}
                        editable={!useProfileData}
                        placeholder="John Doe"
                    />

                    <Text className="text-sm font-bold text-gray-700 mb-2">Contact Phone</Text>
                    <TextInput
                        className={`bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800 border ${useProfileData ? 'border-transparent text-gray-500' : 'border-gray-200'} mb-4`}
                        value={shippingDetails.phone}
                        onChangeText={(t) => setShippingDetails({ ...shippingDetails, phone: t })}
                        editable={!useProfileData}
                        keyboardType="phone-pad"
                        placeholder="+237 6XX XXX XXX"
                    />

                    <Text className="text-sm font-bold text-gray-700 mb-2">Delivery Address (Required)</Text>
                    <TextInput
                        className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800 border border-gray-200 mb-4"
                        value={shippingDetails.address}
                        onChangeText={(t) => setShippingDetails({ ...shippingDetails, address: t })}
                        placeholder="Street, Quarter, Landmarks..."
                        multiline
                    />

                    <Text className="text-sm font-bold text-gray-700 mb-2">City</Text>
                    <TextInput
                        className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800 border border-gray-200 mb-4"
                        value={shippingDetails.city}
                        onChangeText={(t) => setShippingDetails({ ...shippingDetails, city: t })}
                        placeholder="e.g. Yaoundé"
                    />

                    <Text className="text-sm font-bold text-gray-700 mb-2">Delivery Notes (Optional)</Text>
                    <TextInput
                        className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800 border border-gray-200"
                        value={shippingDetails.notes}
                        onChangeText={(t) => setShippingDetails({ ...shippingDetails, notes: t })}
                        placeholder="Leave at front gate..."
                        multiline
                    />
                </View>

                <TouchableOpacity
                    onPress={handleContinue}
                    disabled={!shippingDetails.address || !shippingDetails.city}
                    className={`w-full py-4 rounded-2xl shadow-lg mt-2 mb-10 ${!shippingDetails.address || !shippingDetails.city ? 'bg-gray-300' : 'bg-primary shadow-green-200'
                        }`}
                >
                    <Text className="text-white text-center font-bold text-lg">Continue to Summary</Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
