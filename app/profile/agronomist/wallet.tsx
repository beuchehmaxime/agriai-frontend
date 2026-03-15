import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/Button';
import { TransactionService } from '../../../services/transactionService';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '../../../store/userStore';
import { useRouter } from 'expo-router';

export default function WalletScreen() {
    const { userType } = useUserStore();
    const router = useRouter();

    React.useEffect(() => {
        if (userType !== 'Agronomist') {
            Alert.alert('Unauthorized', 'Only agronomists can access this page.');
            router.replace('/(tabs)/profile');
        }
    }, [userType]);

    const [amount, setAmount] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [provider, setProvider] = useState<'MTN_MOMO' | 'ORANGE_MOMO'>('MTN_MOMO');
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const { data: wallet, isLoading, refetch } = useQuery({
        queryKey: ['wallet'],
        queryFn: () => TransactionService.getWallet(),
    });

    const handleWithdraw = async () => {
        if (!amount || !phoneNumber) {
            Alert.alert('Error', 'Please enter amount and phone number');
            return;
        }

        try {
            setIsWithdrawing(true);
            await TransactionService.withdraw(parseFloat(amount), provider, phoneNumber);
            Alert.alert('Success', 'Withdrawal successful');
            setAmount('');
            setPhoneNumber('');
            refetch();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Withdrawal failed');
        } finally {
            setIsWithdrawing(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="p-4">
                <Text className="text-2xl font-bold text-gray-900 mb-6">My Wallet</Text>

                <View className="bg-primary/10 p-6 rounded-2xl mb-8 items-center border border-primary/20">
                    <Text className="text-gray-600 text-lg mb-2">Available Balance</Text>
                    {isLoading ? (
                        <ActivityIndicator />
                    ) : (
                        <Text className="text-4xl font-bold text-primary">{wallet?.data?.balance ?? wallet?.balance ?? 0} XAF</Text>
                    )}
                </View>

                <Text className="text-xl font-bold text-gray-900 mb-4">Withdraw Funds</Text>

                <View className="flex-row gap-4 mb-4">
                    <TouchableOpacity
                        onPress={() => setProvider('MTN_MOMO')}
                        className={`flex-1 py-4 px-2 rounded-xl border-2 flex-row justify-center items-center ${
                            provider === 'MTN_MOMO' 
                                ? 'bg-yellow-400 border-yellow-400' 
                                : 'bg-transparent border-yellow-400'
                        }`}
                    >
                        <Text className={`font-bold text-center ${
                            provider === 'MTN_MOMO' ? 'text-black' : 'text-yellow-600'
                        }`}>MTN MoMo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setProvider('ORANGE_MOMO')}
                        className={`flex-1 py-4 px-2 rounded-xl border-2 flex-row justify-center items-center ${
                            provider === 'ORANGE_MOMO' 
                                ? 'bg-red-500 border-black' 
                                : 'bg-transparent border-red-500'
                        }`}
                    >
                        <Text className={`font-bold text-center ${
                            provider === 'ORANGE_MOMO' ? 'text-black' : 'text-red-500'
                        }`}>Orange MoMo</Text>
                    </TouchableOpacity>
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Amount (XAF)</Text>
                    <TextInput 
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900" 
                        value={amount} onChangeText={setAmount} placeholder="e.g. 5000" keyboardType="numeric" />
                </View>

                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Phone Number</Text>
                    <TextInput 
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900" 
                        value={phoneNumber} onChangeText={setPhoneNumber} placeholder="e.g. 6XXXXXXX" keyboardType="phone-pad" />
                </View>

                <Button 
                    title={isWithdrawing ? "Processing..." : "Withdraw"} 
                    onPress={handleWithdraw} 
                    disabled={isWithdrawing}
                />
            </ScrollView>
        </SafeAreaView>
    );
}
