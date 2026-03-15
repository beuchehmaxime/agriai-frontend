import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Button from '../../components/Button';
import { TransactionService } from '../../services/transactionService';
import { SubscriptionService } from '../../services/subscriptionService';
import { ConsultationService } from '../../services/consultationService';
import { useUserStore } from '../../store/userStore';

export default function PaymentScreen() {
    const { userType } = useUserStore();
    const { agronomistId, planId, amount, planType, title, durationHours } = useLocalSearchParams();
    const router = useRouter();

    React.useEffect(() => {
        if (userType !== 'Farmer') {
            Alert.alert('Unauthorized', 'Only farmers can purchase subscriptions.');
            router.replace('/(tabs)/consult');
        }
    }, [userType]);

    const [provider, setProvider] = useState<'MTN_MOMO' | 'ORANGE_MOMO'>('MTN_MOMO');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        if (!phoneNumber) {
            Alert.alert('Error', 'Please enter your mobile money number.');
            return;
        }

        setIsProcessing(true);
        try {
            // Purchase Subscription (Backend handles payment processing)
            const quantity = planType === 'HOURLY' ? parseInt(durationHours as string, 10) : 1;
            const subRes = await SubscriptionService.purchaseSubscription(planId as string, quantity, phoneNumber, provider);

            if (!subRes?.success) {
                throw new Error(subRes?.message || 'Failed to process subscription payment.');
            }

            // Initiate consultation
            const consRes = await ConsultationService.createConsultation(agronomistId as string);

            Alert.alert('Success', 'Payment successful! You can now chat with the agronomist.', [
                {
                    text: 'Go to Chat',
                    onPress: () => {
                        if (consRes?.success && consRes.data?.id) {
                            router.replace({ 
                                pathname: '/consult/[id]', 
                                params: { id: consRes.data.id } 
                            });
                        } else {
                            router.replace('/(tabs)/consult');
                        }
                    }
                }
            ]);
        } catch (error: any) {
            console.log(error);
            Alert.alert('Payment Failed', error.message || 'Something went wrong during payment.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="p-4">
                <Text className="text-2xl font-bold text-gray-900 mb-2">Checkout</Text>
                <Text className="text-gray-500 mb-6">Complete your payment to subscribe to this plan.</Text>

                <View className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-200">
                    <Text className="text-gray-500 text-sm mb-1">Plan Summary</Text>
                    <Text className="text-xl font-bold text-gray-900 mb-2">{title}</Text>
                    <View className="flex-row justify-between items-center border-t border-gray-200 py-3 mt-2">
                        <Text className="text-gray-600">Total Amount</Text>
                        <Text className="text-xl font-bold text-primary">{amount} XAF</Text>
                    </View>
                </View>

                <Text className="text-lg font-bold text-gray-900 mb-4">Select Payment Method</Text>

                <View className="flex-row gap-4 mb-6">
                    <Button 
                        title="MTN MoMo" 
                        variant={provider === 'MTN_MOMO' ? 'primary' : 'outline'} 
                        onPress={() => setProvider('MTN_MOMO')} 
                        className="flex-1" 
                    />
                    <Button 
                        title="Orange MoMo" 
                        variant={provider === 'ORANGE_MOMO' ? 'primary' : 'outline'} 
                        onPress={() => setProvider('ORANGE_MOMO')} 
                        className="flex-1" 
                    />
                </View>

                <View className="mb-8">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Mobile Money Number</Text>
                    <TextInput 
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-lg" 
                        value={phoneNumber} 
                        onChangeText={setPhoneNumber} 
                        placeholder={provider === 'MTN_MOMO' ? 'e.g. 67XXXXXXX' : 'e.g. 69XXXXXXX'} 
                        keyboardType="phone-pad" 
                    />
                    <Text className="text-xs text-gray-400 mt-2">
                        A payment prompt will be sent to this number to confirm the transaction.
                    </Text>
                </View>

                <Button 
                    title={isProcessing ? "Processing Payment..." : `Pay ${amount} XAF`} 
                    onPress={handlePayment} 
                    disabled={isProcessing || !phoneNumber}
                    className="py-4"
                />
            </ScrollView>
        </SafeAreaView>
    );
}
