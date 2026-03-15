import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SubscriptionService } from '../../../services/subscriptionService';
import { useQuery } from '@tanstack/react-query';
import Button from '../../../components/Button';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../../store/userStore';

export default function SubscribersScreen() {
    const router = useRouter();
    const { userType } = useUserStore();

    React.useEffect(() => {
        if (userType !== 'Agronomist') {
            router.replace('/(tabs)/profile');
        }
    }, [userType]);

    const { data: subscribers, isLoading } = useQuery({
        queryKey: ['subscribers'],
        queryFn: () => SubscriptionService.getSubscribersList(),
    });

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#4ADE80" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-4">
                <Text className="text-2xl font-bold text-gray-900 mb-6">My Subscribers</Text>
                
                <FlatList
                    data={Array.isArray(subscribers?.data) ? subscribers.data : (Array.isArray(subscribers) ? subscribers : [])}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View className="p-4 bg-gray-50 rounded-xl mb-3 border border-gray-200">
                            <Text className="font-bold text-lg">{item.farmer?.name}</Text>
                            <Text className="text-gray-600 text-sm">Plan: {item.plan?.title}</Text>
                            <Text className="text-gray-600 text-sm">
                                {item.isUnlimited ? 'Unlimited Access' : `Hours Left: ${item.hoursPurchased - item.hoursUsed}`}
                            </Text>
                            
                            <View className="flex-row gap-2 mt-3">
                                <Button 
                                    title="Consultations" 
                                    onPress={() => router.push('/consult')} 
                                    className="flex-1"
                                />
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text className="text-gray-500 text-center mt-10">No subscribers yet.</Text>
                    }
                />
            </View>
        </SafeAreaView>
    );
}
